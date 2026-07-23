"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadCoachPhotoFile } from "@/lib/storage/coach-photos"

const MAX_PHOTOS = 12
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_SIZE = 5 * 1024 * 1024

export async function uploadCoachPhoto(
  formData: FormData
): Promise<{ id?: string; url?: string; error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "COACH") {
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

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, _count: { select: { photos: true } } },
  })
  if (!coach) {
    return { error: "Профиль тренера не найден" }
  }
  if (coach._count.photos >= MAX_PHOTOS) {
    return { error: `Можно загрузить не более ${MAX_PHOTOS} фото` }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await uploadCoachPhotoFile(coach.id, file.type, buffer)
  if ("error" in result) {
    return { error: result.error }
  }

  const photo = await prisma.coachPhoto.create({
    data: { coachId: coach.id, url: result.publicUrl },
  })

  revalidatePath("/coach/profile")
  revalidatePath(`/coaches/${coach.id}`)
  return { id: photo.id, url: result.publicUrl }
}

export async function removeCoachPhoto(photoId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "COACH") {
    return { error: "Не авторизован" }
  }

  const photo = await prisma.coachPhoto.findUnique({
    where: { id: photoId },
    include: { coach: { select: { userId: true } } },
  })
  if (!photo || photo.coach.userId !== session.user.id) {
    return { error: "Фото не найдено" }
  }

  await prisma.coachPhoto.delete({ where: { id: photoId } })

  revalidatePath("/coach/profile")
  revalidatePath(`/coaches/${photo.coachId}`)
  return {}
}
