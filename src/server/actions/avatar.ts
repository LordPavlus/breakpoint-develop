"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadAvatarFile } from "@/lib/storage/avatar"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_SIZE = 5 * 1024 * 1024

export async function uploadAvatar(formData: FormData): Promise<{ url?: string; error?: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Не авторизован" }
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { error: "Файл не найден" }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Поддерживаются только JPEG, PNG и WebP" }
  }
  if (file.size > MAX_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    return {
      error: `Изображение слишком большое (${sizeMb} МБ) — максимум 5 МБ. Сожмите фото или уменьшите разрешение перед загрузкой.`,
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await uploadAvatarFile(session.user.id, file.type, buffer)
  if ("error" in result) {
    return { error: result.error }
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { image: result.publicUrl } })
  revalidatePath("/", "layout")
  return { url: result.publicUrl }
}

export async function removeAvatar(): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Не авторизован" }
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { image: null } })
  revalidatePath("/", "layout")
  return {}
}
