"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendCoachApplicationApprovedEmail } from "@/lib/email/send-coach-application-approved"
import { sendCoachApplicationRejectedEmail } from "@/lib/email/send-coach-application-rejected"

export type SubmitCoachApplicationState = {
  error?: string
  success?: boolean
}

export async function submitCoachApplication(
  _prevState: SubmitCoachApplicationState,
  formData: FormData
): Promise<SubmitCoachApplicationState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Не авторизован" }
  }
  if (session.user.role === "COACH") {
    return { error: "Вы уже тренер" }
  }

  const bio = String(formData.get("bio") ?? "").trim()
  const specialization = String(formData.get("specialization") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  if (!bio) {
    return { error: "Расскажите о своём опыте" }
  }

  const existing = await prisma.coachApplication.findUnique({ where: { userId } })

  if (existing && existing.status !== "REJECTED") {
    return {
      error:
        existing.status === "PENDING"
          ? "Заявка уже отправлена и находится на рассмотрении"
          : "Заявка уже одобрена",
    }
  }

  await prisma.coachApplication.upsert({
    where: { userId },
    create: { userId, bio, specialization },
    update: {
      bio,
      specialization,
      status: "PENDING",
      adminNote: null,
      reviewedAt: null,
      reviewedById: null,
    },
  })

  revalidatePath("/become-coach")
  return { success: true }
}

export type ReviewCoachApplicationState = {
  error?: string
}

export async function approveCoachApplication(
  _prevState: ReviewCoachApplicationState,
  formData: FormData
): Promise<ReviewCoachApplicationState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const applicationId = String(formData.get("applicationId") ?? "")
  if (!applicationId) {
    return { error: "Заявка не указана" }
  }

  const application = await prisma.coachApplication.findUnique({
    where: { id: applicationId },
    include: { user: true },
  })

  if (!application || application.status !== "PENDING") {
    return { error: "Заявка не найдена или уже рассмотрена" }
  }

  await prisma.$transaction([
    prisma.coachApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: session.user.id },
    }),
    prisma.user.update({ where: { id: application.userId }, data: { role: "COACH" } }),
    prisma.coachProfile.upsert({
      where: { userId: application.userId },
      update: { bio: application.bio, specialization: application.specialization },
      create: {
        userId: application.userId,
        bio: application.bio,
        specialization: application.specialization,
      },
    }),
  ])

  if (application.user.email) {
    await sendCoachApplicationApprovedEmail(application.user.email)
  }

  revalidatePath("/admin/coach-applications")
  revalidatePath("/admin/users")
  return {}
}

export async function rejectCoachApplication(
  _prevState: ReviewCoachApplicationState,
  formData: FormData
): Promise<ReviewCoachApplicationState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const applicationId = String(formData.get("applicationId") ?? "")
  const adminNote = String(formData.get("adminNote") ?? "").trim()
  if (!applicationId) {
    return { error: "Заявка не указана" }
  }

  const application = await prisma.coachApplication.findUnique({
    where: { id: applicationId },
    include: { user: true },
  })

  if (!application || application.status !== "PENDING") {
    return { error: "Заявка не найдена или уже рассмотрена" }
  }

  await prisma.coachApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      adminNote: adminNote || null,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  })

  if (application.user.email) {
    await sendCoachApplicationRejectedEmail(application.user.email, adminNote || null)
  }

  revalidatePath("/admin/coach-applications")
  return {}
}
