"use server"

import { NtrpLevel } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyTelegramAuth, widgetUserToAuthData, type TelegramWidgetUser } from "@/lib/telegram"

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

export type TelegramLinkState = {
  error?: string
  success?: boolean
}

export async function linkTelegramAccount(
  data: TelegramWidgetUser
): Promise<TelegramLinkState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Не авторизован" }
  }

  const authData = widgetUserToAuthData(data)

  if (!verifyTelegramAuth(authData)) {
    return { error: "Не удалось проверить данные Telegram" }
  }

  const existing = await prisma.user.findUnique({
    where: { telegramId: authData.id },
    select: { id: true },
  })

  if (existing && existing.id !== userId) {
    return { error: "Этот Telegram-аккаунт уже привязан к другому пользователю" }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { telegramId: authData.id, telegramUsername: authData.username ?? null },
  })

  return { success: true }
}

export async function unlinkTelegramAccount(): Promise<TelegramLinkState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Не авторизован" }
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true },
  })

  if (!user.email) {
    return { error: "Нельзя отключить Telegram — у аккаунта нет email для входа" }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { telegramId: null, telegramUsername: null },
  })

  return { success: true }
}
