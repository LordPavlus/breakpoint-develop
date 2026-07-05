import { Prisma, type PromoDiscountType, type PromoScope } from "@prisma/client"

import { generateUniqueRewardCode } from "@/lib/referral"

type Tx = Prisma.TransactionClient

export const REFERRAL_DISCOUNT_PERCENT = 10 // скидка приглашённому на первую покупку
export const REFERRAL_REWARD_PERCENT = 10 // бонусный промокод пригласившему

export const promoDiscountTypeLabels: Record<PromoDiscountType, string> = {
  PERCENT: "Процент от суммы",
  FIXED: "Фиксированная сумма, ₽",
}

export const promoScopeLabels: Record<PromoScope, string> = {
  ALL: "Везде",
  TRAINING_BOOKING: "Только тренировки",
  TOURNAMENT_ENTRY: "Только турниры",
}

export type PromoResolution =
  | { kind: "none" }
  | { kind: "error"; error: string }
  | { kind: "promo"; promoCodeId: string; discountAmount: Prisma.Decimal }
  | { kind: "referral"; referrerId: string; discountAmount: Prisma.Decimal }

function calculateDiscount(
  type: PromoDiscountType,
  value: Prisma.Decimal | number,
  baseAmount: Prisma.Decimal
): Prisma.Decimal {
  const decimalValue = value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value)
  let amount = type === "PERCENT" ? baseAmount.mul(decimalValue).div(100) : decimalValue

  if (amount.lt(0)) amount = new Prisma.Decimal(0)
  if (amount.gt(baseAmount)) amount = baseAmount

  return amount.toDecimalPlaces(2)
}

// Промокод и реферальный код вводятся в одно поле "Промокод" — сначала ищем
// среди PromoCode, затем среди User.referralCode (реферальная скидка на
// первую покупку). Вызывается внутри $transaction перед созданием
// Booking/TournamentRegistration.
export async function resolvePromoCode(
  tx: Tx,
  rawCode: string,
  userId: string,
  scope: PromoScope,
  baseAmount: Prisma.Decimal
): Promise<PromoResolution> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { kind: "none" }

  const promo = await tx.promoCode.findUnique({ where: { code } })

  if (promo) {
    if (!promo.active) {
      return { kind: "error", error: "Промокод неактивен" }
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return { kind: "error", error: "Срок действия промокода истёк" }
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return { kind: "error", error: "Лимит использований промокода исчерпан" }
    }
    if (promo.scope !== "ALL" && promo.scope !== scope) {
      return { kind: "error", error: "Промокод не действует для этой покупки" }
    }
    if (promo.ownerId && promo.ownerId !== userId) {
      return { kind: "error", error: "Этот промокод недействителен для вас" }
    }

    const redeemed = await tx.promoCodeRedemption.findUnique({
      where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
    })
    if (redeemed) {
      return { kind: "error", error: "Вы уже использовали этот промокод" }
    }

    return {
      kind: "promo",
      promoCodeId: promo.id,
      discountAmount: calculateDiscount(promo.discountType, promo.discountValue, baseAmount),
    }
  }

  const referrer = await tx.user.findUnique({ where: { referralCode: code } })
  if (!referrer) {
    return { kind: "error", error: "Промокод не найден" }
  }
  if (referrer.id === userId) {
    return { kind: "error", error: "Нельзя использовать собственный код" }
  }

  const alreadyReferred = await tx.referral.findUnique({ where: { referredId: userId } })
  if (alreadyReferred) {
    return { kind: "error", error: "Реферальная скидка действует только при первой покупке" }
  }

  const [bookingCount, registrationCount] = await Promise.all([
    tx.booking.count({ where: { playerId: userId } }),
    tx.tournamentRegistration.count({ where: { playerId: userId } }),
  ])
  if (bookingCount > 0 || registrationCount > 0) {
    return { kind: "error", error: "Реферальная скидка действует только при первой покупке" }
  }

  return {
    kind: "referral",
    referrerId: referrer.id,
    discountAmount: calculateDiscount("PERCENT", REFERRAL_DISCOUNT_PERCENT, baseAmount),
  }
}

// Фиксирует применение результата resolvePromoCode внутри той же транзакции,
// что и создание Booking/TournamentRegistration: для промокода — запись о
// погашении + инкремент usedCount; для реферала — связка Referral и
// одноразовый бонусный промокод пригласившему.
export async function applyPromoResolution(
  tx: Tx,
  resolution: PromoResolution,
  ctx: { userId: string; bookingId?: string; tournamentRegistrationId?: string }
): Promise<void> {
  if (resolution.kind === "promo") {
    await tx.promoCodeRedemption.create({
      data: {
        promoCodeId: resolution.promoCodeId,
        userId: ctx.userId,
        bookingId: ctx.bookingId,
        tournamentRegistrationId: ctx.tournamentRegistrationId,
        discountAmount: resolution.discountAmount,
      },
    })
    await tx.promoCode.update({
      where: { id: resolution.promoCodeId },
      data: { usedCount: { increment: 1 } },
    })
    return
  }

  if (resolution.kind === "referral") {
    const reward = await tx.promoCode.create({
      data: {
        code: await generateUniqueRewardCode(tx),
        discountType: "PERCENT",
        discountValue: REFERRAL_REWARD_PERCENT,
        scope: "ALL",
        maxUses: 1,
        ownerId: resolution.referrerId,
      },
    })
    await tx.referral.create({
      data: {
        referrerId: resolution.referrerId,
        referredId: ctx.userId,
        rewardPromoCodeId: reward.id,
      },
    })
  }
}
