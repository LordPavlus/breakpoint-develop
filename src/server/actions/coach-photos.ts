"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCoachPhotoUploadUrl, type CoachPhotoUploadUrl } from "@/lib/storage/coach-photos"

const MAX_PHOTOS = 12

export async function requestCoachPhotoUploadUrl(
  contentType: string
): Promise<CoachPhotoUploadUrl | { error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "COACH") {
    return { error: "Не авторизован" }
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

  return createCoachPhotoUploadUrl(coach.id, contentType)
}

export async function saveCoachPhoto(url: string): Promise<{ id?: string; error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "COACH") {
    return { error: "Не авторизован" }
  }

  const publicUrlPrefix = process.env.R2_PUBLIC_URL ?? ""
  if (!publicUrlPrefix || !url.startsWith(publicUrlPrefix)) {
    return { error: "Некорректный адрес файла" }
  }

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!coach) {
    return { error: "Профиль тренера не найден" }
  }

  const photo = await prisma.coachPhoto.create({ data: { coachId: coach.id, url } })

  revalidatePath("/coach/profile")
  revalidatePath(`/coaches/${coach.id}`)
  return { id: photo.id }
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
