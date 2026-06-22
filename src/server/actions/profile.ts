"use server"

import { NtrpLevel } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type UpdateProfileState = {
  error?: string
  success?: boolean
}

const ntrpValues = new Set<string>(Object.values(NtrpLevel))

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Не авторизован" }
  }

  const name = String(formData.get("name") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()
  const ntrpRaw = String(formData.get("ntrpLevel") ?? "")

  if (!name) {
    return { error: "Укажите имя" }
  }

  const ntrpLevel = ntrpValues.has(ntrpRaw) ? (ntrpRaw as NtrpLevel) : null

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { name } }),
    prisma.playerProfile.upsert({
      where: { userId },
      update: { bio: bio || null, ntrpLevel },
      create: { userId, bio: bio || null, ntrpLevel },
    }),
  ])

  return { success: true }
}

export async function saveTelegramUsername(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: "Не авторизован" }

  const raw = String(formData.get("telegramUsername") ?? "").trim()
  const username = raw.startsWith("@") ? raw.slice(1) : raw

  await prisma.user.update({
    where: { id: userId },
    data: { telegramUsername: username || null },
  })

  return { success: true }
}
