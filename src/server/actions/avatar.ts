"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAvatarUploadUrl, type AvatarUploadUrl } from "@/lib/storage/avatar"

export async function requestAvatarUploadUrl(
  contentType: string
): Promise<AvatarUploadUrl | { error: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Не авторизован" }
  }

  return createAvatarUploadUrl(session.user.id, contentType)
}

export async function saveAvatarUrl(url: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Не авторизован" }
  }

  const publicUrlPrefix = process.env.R2_PUBLIC_URL ?? ""
  if (!publicUrlPrefix || !url.startsWith(publicUrlPrefix)) {
    return { error: "Некорректный адрес файла" }
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { image: url } })
  return {}
}

export async function removeAvatar(): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Не авторизован" }
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { image: null } })
  return {}
}
