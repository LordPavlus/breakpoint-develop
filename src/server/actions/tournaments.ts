"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { NtrpLevel, TournamentFormat, TournamentStatus, type Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendTournamentCancelledEmail } from "@/lib/email/send-tournament-cancelled"
import { sendPushToUser } from "@/lib/push/send"
import { applyPromoResolution, resolvePromoCode } from "@/lib/promo"
import { yookassaConfigured } from "@/lib/yookassa/client"
import { createPayment } from "@/lib/yookassa/payments"
import { createRefund } from "@/lib/yookassa/refunds"
import { closeRegistrationAndAdvance } from "@/lib/tournament/lifecycle"

export type RegisterForTournamentState = {
  error?: string
}

export async function registerForTournament(
  _prevState: RegisterForTournamentState,
  formData: FormData
): Promise<RegisterForTournamentState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const tournamentId = String(formData.get("tournamentId") ?? "")
  if (!tournamentId) {
    return { error: "Турнир не указан" }
  }

  const promoCodeRaw = String(formData.get("promoCode") ?? "").trim()

  const result = await prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.findUnique({
      where: { id: tournamentId },
    })

    if (!tournament) {
      return { error: "NOT_FOUND" as const }
    }

    if (
      tournament.status !== "REGISTRATION_OPEN" ||
      tournament.registrationDeadline < new Date()
    ) {
      return { error: "REGISTRATION_CLOSED" as const }
    }

    const existing = await tx.tournamentRegistration.findUnique({
      where: { tournamentId_playerId: { tournamentId, playerId: userId } },
    })

    if (existing) {
      return { error: "ALREADY_REGISTERED" as const }
    }

    if (tournament.maxParticipants != null) {
      const count = await tx.tournamentRegistration.count({
        where: { tournamentId, status: { not: "CANCELLED" } },
      })

      if (count >= tournament.maxParticipants) {
        return { error: "FULL" as const }
      }
    }

    const promoResolution = await resolvePromoCode(
      tx,
      promoCodeRaw,
      userId,
      "TOURNAMENT_ENTRY",
      tournament.entryFee
    )
    if (promoResolution.kind === "error") {
      return { error: "PROMO" as const, promoError: promoResolution.error }
    }

    const feeAtRegistration =
      promoResolution.kind === "none"
        ? tournament.entryFee
        : tournament.entryFee.sub(promoResolution.discountAmount)

    const playerProfile = await tx.playerProfile.findUnique({
      where: { userId },
    })

    const registration = await tx.tournamentRegistration.create({
      data: {
        tournamentId,
        playerId: userId,
        ntrpLevelAtEntry: playerProfile?.ntrpLevel ?? null,
        feeAtRegistration,
      },
    })

    await applyPromoResolution(tx, promoResolution, {
      userId,
      tournamentRegistrationId: registration.id,
    })

    return { registration, tournament }
  })

  if ("error" in result) {
    switch (result.error) {
      case "ALREADY_REGISTERED":
        return { error: "Вы уже зарегистрированы на этот турнир." }
      case "REGISTRATION_CLOSED":
        return { error: "Регистрация на этот турнир закрыта." }
      case "FULL":
        return { error: "Свободных мест не осталось." }
      case "PROMO":
        return { error: result.promoError }
      default:
        return { error: "Турнир не найден." }
    }
  }

  const { registration, tournament } = result
  const entryFee = registration.feeAtRegistration ?? tournament.entryFee

  if (yookassaConfigured) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

    const payment = await createPayment({
      amount: entryFee.toNumber(),
      description: `Взнос за участие в турнире «${tournament.title}»`,
      returnUrl: `${baseUrl}/tournaments/${tournamentId}?registered=${registration.id}`,
      idempotenceKey: registration.id,
      metadata: {
        tournamentRegistrationId: registration.id,
        purpose: "TOURNAMENT_ENTRY",
      },
    })

    await prisma.payment.create({
      data: {
        yookassaId: payment.id,
        purpose: "TOURNAMENT_ENTRY",
        amount: entryFee,
        tournamentRegistrationId: registration.id,
        payerId: userId,
        confirmationUrl: payment.confirmation?.confirmation_url,
        idempotenceKey: registration.id,
        rawPayload: payment as unknown as Prisma.InputJsonValue,
      },
    })

    if (payment.confirmation?.confirmation_url) {
      redirect(payment.confirmation.confirmation_url)
    }
  }

  redirect(`/tournaments/${tournamentId}?registered=${registration.id}`)
}

export type CreateTournamentState = {
  error?: string
}

const ntrpValues = new Set<string>(Object.values(NtrpLevel))
const formatValues = new Set<string>(Object.values(TournamentFormat))
const statusValues = new Set<string>(Object.values(TournamentStatus))

export async function createTournament(
  _prevState: CreateTournamentState,
  formData: FormData
): Promise<CreateTournamentState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const formatRaw = String(formData.get("format") ?? "")
  const entryFee = Number(formData.get("entryFee"))
  const location = String(formData.get("location") ?? "").trim()
  const startsAtRaw = String(formData.get("startsAt") ?? "")
  const endsAtRaw = String(formData.get("endsAt") ?? "")
  const registrationDeadlineRaw = String(formData.get("registrationDeadline") ?? "")
  const minParticipantsRaw = String(formData.get("minParticipants") ?? "")
  const maxParticipantsRaw = String(formData.get("maxParticipants") ?? "")
  const minNtrpLevelRaw = String(formData.get("minNtrpLevel") ?? "")
  const maxNtrpLevelRaw = String(formData.get("maxNtrpLevel") ?? "")

  if (!title) {
    return { error: "Укажите название турнира" }
  }
  if (!description) {
    return { error: "Укажите описание турнира" }
  }
  if (!formatValues.has(formatRaw)) {
    return { error: "Некорректный формат турнира" }
  }
  if (!Number.isFinite(entryFee) || entryFee < 0) {
    return { error: "Некорректный взнос за участие" }
  }

  const startsAt = new Date(startsAtRaw)
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Укажите дату начала турнира" }
  }

  const registrationDeadline = new Date(registrationDeadlineRaw)
  if (Number.isNaN(registrationDeadline.getTime())) {
    return { error: "Укажите дедлайн регистрации" }
  }

  let endsAt: Date | null = null
  if (endsAtRaw) {
    endsAt = new Date(endsAtRaw)
    if (Number.isNaN(endsAt.getTime())) {
      return { error: "Некорректная дата окончания турнира" }
    }
  }

  const minParticipants = minParticipantsRaw ? Number(minParticipantsRaw) : null
  const maxParticipants = maxParticipantsRaw ? Number(maxParticipantsRaw) : null

  const minNtrpLevel = ntrpValues.has(minNtrpLevelRaw)
    ? (minNtrpLevelRaw as NtrpLevel)
    : null
  const maxNtrpLevel = ntrpValues.has(maxNtrpLevelRaw)
    ? (maxNtrpLevelRaw as NtrpLevel)
    : null

  await prisma.tournament.create({
    data: {
      title,
      description,
      format: formatRaw as TournamentFormat,
      entryFee,
      location: location || null,
      startsAt,
      endsAt,
      registrationDeadline,
      minParticipants,
      maxParticipants,
      minNtrpLevel,
      maxNtrpLevel,
    },
  })

  revalidatePath("/admin/tournaments")
  redirect("/admin/tournaments")
}

export type UpdateTournamentStatusState = {
  error?: string
}

export async function updateTournamentStatus(
  _prevState: UpdateTournamentStatusState,
  formData: FormData
): Promise<UpdateTournamentStatusState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const tournamentId = String(formData.get("tournamentId") ?? "")
  const statusRaw = String(formData.get("status") ?? "")

  if (!tournamentId || !statusValues.has(statusRaw)) {
    return { error: "Некорректные данные" }
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: statusRaw as TournamentStatus },
  })

  revalidatePath("/admin/tournaments")
  revalidatePath("/tournaments")
  return {}
}

export type CloseTournamentRegistrationState = {
  error?: string
}

export async function closeTournamentRegistration(
  _prevState: CloseTournamentRegistrationState,
  formData: FormData
): Promise<CloseTournamentRegistrationState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const tournamentId = String(formData.get("tournamentId") ?? "")
  if (!tournamentId) {
    return { error: "Турнир не указан" }
  }

  const result = await closeRegistrationAndAdvance(tournamentId)

  if (result.status === "NOT_APPLICABLE") {
    return { error: "Регистрация уже закрыта или турнир не найден" }
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath("/admin/tournaments")
  revalidatePath(`/tournaments/${tournamentId}`)
  revalidatePath("/tournaments")
  return {}
}

export type MarkTournamentRefundProcessedState = {
  error?: string
  success?: string
}

// Регистрации отменённого турнира, оставшиеся PAID с SUCCEEDED-платежом —
// деньги ещё не возвращены игроку (см. manualReviewNeeded в
// lib/tournament/refunds.ts). Если ЮKassa настроена — пытается выполнить
// настоящий возврат через Refund API; если нет — фиксирует, что возврат
// выполнен вручную (банковским переводом и т.п.).
export async function markTournamentRefundProcessed(
  _prevState: MarkTournamentRefundProcessedState,
  formData: FormData
): Promise<MarkTournamentRefundProcessedState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const registrationId = String(formData.get("registrationId") ?? "")
  if (!registrationId) {
    return { error: "Регистрация не указана" }
  }

  const registration = await prisma.tournamentRegistration.findUnique({
    where: { id: registrationId },
    include: { payment: true, tournament: true, player: true },
  })

  if (
    !registration ||
    registration.status !== "PAID" ||
    registration.tournament.status !== "CANCELLED" ||
    registration.payment?.status !== "SUCCEEDED"
  ) {
    return { error: "Регистрация не найдена или уже обработана" }
  }

  if (yookassaConfigured) {
    await createRefund({
      paymentId: registration.payment.yookassaId,
      amount: registration.payment.amount.toNumber(),
      idempotenceKey: `refund-${registration.payment.id}`,
    })
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: registration.payment.id },
      data: { status: "REFUNDED" },
    }),
    prisma.tournamentRegistration.update({
      where: { id: registration.id },
      data: { status: "REFUNDED" },
    }),
  ])

  if (registration.player.email) {
    await sendTournamentCancelledEmail(registration.player.email, {
      title: registration.tournament.title,
      refunded: true,
    })
  }

  await sendPushToUser(registration.playerId, {
    title: "Возврат выполнен",
    body: `Взнос за турнир «${registration.tournament.title}» возвращён`,
    url: "/account/tournaments",
  })

  revalidatePath("/admin/payments")
  return { success: "Возврат отмечен выполненным" }
}
