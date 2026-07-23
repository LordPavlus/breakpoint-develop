"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { recalculateCoachRating } from "@/lib/reviews"

export type SubmitCoachReviewState = {
  error?: string
  success?: boolean
}

export async function submitCoachReview(
  _prevState: SubmitCoachReviewState,
  formData: FormData
): Promise<SubmitCoachReviewState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Войдите, чтобы оставить отзыв" }
  }

  const coachId = String(formData.get("coachId") ?? "")
  const rating = Number(formData.get("rating"))
  const comment = String(formData.get("comment") ?? "").trim()

  if (!coachId) {
    return { error: "Тренер не найден" }
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Укажите оценку от 1 до 5" }
  }

  const coach = await prisma.coachProfile.findUnique({
    where: { id: coachId },
    select: { userId: true },
  })
  if (!coach) {
    return { error: "Тренер не найден" }
  }
  if (coach.userId === userId) {
    return { error: "Нельзя оставить отзыв самому себе" }
  }

  const existing = await prisma.review.findFirst({
    where: { coachId, authorId: userId, bookingId: null, status: { in: ["PENDING", "APPROVED"] } },
  })
  if (existing) {
    return {
      error:
        existing.status === "PENDING"
          ? "Ваш отзыв уже отправлен и ожидает модерации"
          : "Вы уже оставляли отзыв этому тренеру",
    }
  }

  await prisma.review.create({
    data: { coachId, authorId: userId, rating, comment: comment || null, status: "PENDING" },
  })

  revalidatePath(`/coaches/${coachId}`)
  return { success: true }
}

export type ReviewModerationState = {
  error?: string
}

export async function approveReview(
  _prevState: ReviewModerationState,
  formData: FormData
): Promise<ReviewModerationState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const reviewId = String(formData.get("reviewId") ?? "")
  if (!reviewId) {
    return { error: "Отзыв не указан" }
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review || review.status !== "PENDING") {
    return { error: "Отзыв не найден или уже рассмотрен" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: reviewId },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: session.user.id },
    })
    await recalculateCoachRating(tx, review.coachId)
  })

  revalidatePath("/admin/reviews")
  revalidatePath(`/coaches/${review.coachId}`)
  return {}
}

export async function rejectReview(
  _prevState: ReviewModerationState,
  formData: FormData
): Promise<ReviewModerationState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const reviewId = String(formData.get("reviewId") ?? "")
  if (!reviewId) {
    return { error: "Отзыв не указан" }
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review || review.status !== "PENDING") {
    return { error: "Отзыв не найден или уже рассмотрен" }
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: session.user.id },
  })

  revalidatePath("/admin/reviews")
  return {}
}
