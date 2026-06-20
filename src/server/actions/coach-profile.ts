"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type UpdateCoachProfileState = {
  error?: string
  success?: boolean
}

export async function updateCoachProfile(
  _prevState: UpdateCoachProfileState,
  formData: FormData
): Promise<UpdateCoachProfileState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "COACH") {
    return { error: "Не авторизован" }
  }

  const userId = session.user.id

  const name = String(formData.get("name") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()
  const payoutInfo = String(formData.get("payoutInfo") ?? "").trim()
  const specialization = String(formData.get("specialization") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  if (!name) {
    return { error: "Укажите имя" }
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { name } }),
    prisma.coachProfile.update({
      where: { userId },
      data: { bio: bio || null, specialization, payoutInfo: payoutInfo || null },
    }),
  ])

  return { success: true }
}
