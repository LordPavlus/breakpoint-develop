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
  const phone = String(formData.get("phone") ?? "").trim()
  const ntrpRaw = String(formData.get("ntrpLevel") ?? "")
  const weekdayAvailability = String(formData.get("weekdayAvailability") ?? "").trim()
  const weekendAvailability = String(formData.get("weekendAvailability") ?? "").trim()
  const preferredDays = formData.getAll("preferredDays").map(String)
  const districtCheckboxes = formData.getAll("preferredDistricts").map(String)
  const customDistrict = String(formData.get("customDistrict") ?? "").trim()
  const preferredDistricts = [
    ...districtCheckboxes,
    ...(customDistrict ? [customDistrict] : []),
  ]

  if (!name) {
    return { error: "Укажите имя" }
  }

  const ntrpLevel = ntrpValues.has(ntrpRaw) ? (ntrpRaw as NtrpLevel) : null

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { name, phone: phone || null } }),
    prisma.playerProfile.upsert({
      where: { userId },
      update: {
        bio: bio || null,
        ntrpLevel,
        weekdayAvailability: weekdayAvailability || null,
        weekendAvailability: weekendAvailability || null,
        preferredDays,
        preferredDistricts,
      },
      create: {
        userId,
        bio: bio || null,
        ntrpLevel,
        weekdayAvailability: weekdayAvailability || null,
        weekendAvailability: weekendAvailability || null,
        preferredDays,
        preferredDistricts,
      },
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
