"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type UpdateSettingsState = {
  error?: string
  success?: boolean
}

export async function updateAdminSettings(
  _prevState: UpdateSettingsState,
  formData: FormData
): Promise<UpdateSettingsState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const minPrice = Number(formData.get("minTrainingPrice"))
  const maxPrice = Number(formData.get("maxTrainingPrice"))
  const commissionPct = Number(formData.get("platformCommissionPct"))

  if (!Number.isFinite(minPrice) || minPrice <= 0) {
    return { error: "Минимальная цена должна быть больше 0" }
  }
  if (!Number.isFinite(maxPrice) || maxPrice <= minPrice) {
    return { error: "Максимальная цена должна быть больше минимальной" }
  }
  if (!Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 100) {
    return { error: "Комиссия должна быть от 0 до 100%" }
  }

  await prisma.adminSettings.update({
    where: { id: "singleton" },
    data: {
      minTrainingPrice: minPrice,
      maxTrainingPrice: maxPrice,
      platformCommissionPct: commissionPct,
      updatedById: session.user.id,
    },
  })

  revalidatePath("/admin/settings")
  return { success: true }
}
