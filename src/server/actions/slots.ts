"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAdminSettings } from "@/lib/settings"

export type CreateSlotState = {
  error?: string
}

export async function createSlot(
  _prevState: CreateSlotState,
  formData: FormData
): Promise<CreateSlotState> {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }
  if (session.user.role !== "COACH") {
    redirect("/")
  }

  const date = String(formData.get("date") ?? "")
  const startTime = String(formData.get("startTime") ?? "")
  const durationMinutes = Number(formData.get("durationMinutes"))
  const location = String(formData.get("location") ?? "").trim()
  const price = Number(formData.get("price"))

  if (!date || !startTime || !location) {
    return { error: "Заполните все поля" }
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { error: "Некорректная длительность" }
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Некорректная цена" }
  }

  const startsAt = new Date(`${date}T${startTime}:00`)
  if (Number.isNaN(startsAt.getTime()) || startsAt < new Date()) {
    return { error: "Укажите корректную дату и время в будущем" }
  }
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000)

  const settings = await getAdminSettings()
  const minPrice = settings.minTrainingPrice.toNumber()
  const maxPrice = settings.maxTrainingPrice.toNumber()

  if (price < minPrice || price > maxPrice) {
    return { error: `Цена должна быть от ${minPrice} до ${maxPrice} ₽` }
  }

  const coachProfile = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  await prisma.trainingSlot.create({
    data: {
      coachId: coachProfile.id,
      startsAt,
      endsAt,
      location,
      price,
    },
  })

  revalidatePath("/coach/slots")
  redirect("/coach/slots")
}

export type CancelSlotState = {
  error?: string
}

export async function cancelSlot(
  _prevState: CancelSlotState,
  formData: FormData
): Promise<CancelSlotState> {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }
  if (session.user.role !== "COACH") {
    redirect("/")
  }

  const slotId = String(formData.get("slotId") ?? "")
  if (!slotId) {
    return { error: "Слот не указан" }
  }

  const coachProfile = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const updated = await prisma.trainingSlot.updateMany({
    where: { id: slotId, coachId: coachProfile.id, status: "AVAILABLE" },
    data: { status: "CANCELLED" },
  })

  if (updated.count === 0) {
    return { error: "Слот нельзя отменить (уже забронирован или не найден)" }
  }

  revalidatePath("/coach/slots")
  return {}
}
