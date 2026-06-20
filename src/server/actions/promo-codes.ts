"use server"

import { revalidatePath } from "next/cache"
import { Prisma, PromoDiscountType, PromoScope } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type CreatePromoCodeState = {
  error?: string
  success?: boolean
}

const discountTypeValues = new Set<string>(Object.values(PromoDiscountType))
const scopeValues = new Set<string>(Object.values(PromoScope))

export async function createPromoCode(
  _prevState: CreatePromoCodeState,
  formData: FormData
): Promise<CreatePromoCodeState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const code = String(formData.get("code") ?? "").trim().toUpperCase()
  const discountTypeRaw = String(formData.get("discountType") ?? "")
  const discountValue = Number(formData.get("discountValue"))
  const scopeRaw = String(formData.get("scope") ?? "")
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim()
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim()

  if (!code) {
    return { error: "Укажите код промокода" }
  }
  if (!discountTypeValues.has(discountTypeRaw)) {
    return { error: "Некорректный тип скидки" }
  }
  if (!scopeValues.has(scopeRaw)) {
    return { error: "Некорректная область действия" }
  }
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: "Укажите размер скидки больше 0" }
  }
  if (discountTypeRaw === "PERCENT" && discountValue > 100) {
    return { error: "Скидка в процентах не может быть больше 100" }
  }

  let maxUses: number | null = null
  if (maxUsesRaw) {
    maxUses = Number(maxUsesRaw)
    if (!Number.isInteger(maxUses) || maxUses <= 0) {
      return { error: "Лимит использований должен быть целым числом больше 0" }
    }
  }

  let expiresAt: Date | null = null
  if (expiresAtRaw) {
    expiresAt = new Date(expiresAtRaw)
    if (Number.isNaN(expiresAt.getTime())) {
      return { error: "Некорректная дата окончания действия" }
    }
  }

  try {
    await prisma.promoCode.create({
      data: {
        code,
        discountType: discountTypeRaw as PromoDiscountType,
        discountValue,
        scope: scopeRaw as PromoScope,
        maxUses,
        expiresAt,
      },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Промокод с таким кодом уже существует" }
    }
    throw err
  }

  revalidatePath("/admin/promo-codes")
  return { success: true }
}

export type TogglePromoCodeState = {
  error?: string
}

export async function togglePromoCodeActive(
  _prevState: TogglePromoCodeState,
  formData: FormData
): Promise<TogglePromoCodeState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const id = String(formData.get("id") ?? "")
  const activeRaw = String(formData.get("active") ?? "")

  if (!id || (activeRaw !== "true" && activeRaw !== "false")) {
    return { error: "Некорректные данные" }
  }

  await prisma.promoCode.update({
    where: { id },
    data: { active: activeRaw === "true" },
  })

  revalidatePath("/admin/promo-codes")
  return {}
}
