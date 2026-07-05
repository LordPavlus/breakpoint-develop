"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { applyPromoResolution, resolvePromoCode } from "@/lib/promo"
import { yookassaConfigured } from "@/lib/yookassa/client"
import { createPayment } from "@/lib/yookassa/payments"

export type CreateBookingState = {
  error?: string
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})

export async function createBooking(
  _prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const slotId = String(formData.get("slotId") ?? "")
  if (!slotId) {
    return { error: "Слот не указан" }
  }

  const promoCodeRaw = String(formData.get("promoCode") ?? "").trim()

  const result = await prisma.$transaction(async (tx) => {
    const slot = await tx.trainingSlot.findUnique({
      where: { id: slotId },
      include: { coach: { include: { user: true } } },
    })

    if (!slot) {
      return { error: "NOT_FOUND" as const }
    }

    const promoResolution = await resolvePromoCode(
      tx,
      promoCodeRaw,
      userId,
      "TRAINING_BOOKING",
      slot.price
    )
    if (promoResolution.kind === "error") {
      return { error: "PROMO" as const, promoError: promoResolution.error }
    }

    const updated = await tx.trainingSlot.updateMany({
      where: { id: slotId, status: "AVAILABLE" },
      data: { status: "BOOKED" },
    })

    if (updated.count === 0) {
      return { error: "SLOT_TAKEN" as const }
    }

    const priceAtBooking =
      promoResolution.kind === "none"
        ? slot.price
        : slot.price.sub(promoResolution.discountAmount)

    const booking = await tx.booking.create({
      data: {
        slotId,
        playerId: userId,
        priceAtBooking,
      },
    })

    await applyPromoResolution(tx, promoResolution, { userId, bookingId: booking.id })

    return { booking, slot }
  })

  if ("error" in result) {
    if (result.error === "SLOT_TAKEN") {
      return { error: "Этот слот уже забронирован. Выберите другой." }
    }
    if (result.error === "PROMO") {
      return { error: result.promoError }
    }
    return { error: "Слот не найден." }
  }

  const { booking, slot } = result

  if (yookassaConfigured) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const coachName = slot.coach.user.name ?? "тренер"

    const payment = await createPayment({
      amount: booking.priceAtBooking.toNumber(),
      description: `Тренировка с ${coachName}, ${dateFormatter.format(slot.startsAt)}`,
      returnUrl: `${baseUrl}/trainings?booked=${booking.id}`,
      idempotenceKey: booking.id,
      metadata: { bookingId: booking.id, purpose: "TRAINING_BOOKING" },
    })

    await prisma.payment.create({
      data: {
        yookassaId: payment.id,
        purpose: "TRAINING_BOOKING",
        amount: booking.priceAtBooking,
        bookingId: booking.id,
        payerId: userId,
        confirmationUrl: payment.confirmation?.confirmation_url,
        idempotenceKey: booking.id,
        rawPayload: payment as unknown as Prisma.InputJsonValue,
      },
    })

    if (payment.confirmation?.confirmation_url) {
      redirect(payment.confirmation.confirmation_url)
    }
  }

  redirect(`/trainings?booked=${booking.id}`)
}

export type CancelBookingState = {
  error?: string
}

export async function cancelBooking(
  _prevState: CancelBookingState,
  formData: FormData
): Promise<CancelBookingState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const bookingId = String(formData.get("bookingId") ?? "")
  if (!bookingId) {
    return { error: "Бронирование не указано" }
  }

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    })

    if (!booking || booking.playerId !== userId) {
      return { error: "NOT_FOUND" as const }
    }

    if (booking.status === "CANCELLED") {
      return { error: "ALREADY_CANCELLED" as const }
    }

    if (booking.status === "COMPLETED_CONFIRMED") {
      return { error: "COMPLETED" as const }
    }

    if (booking.slot.startsAt <= new Date()) {
      return { error: "STARTED" as const }
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    })

    await tx.trainingSlot.update({
      where: { id: booking.slotId },
      data: { status: "AVAILABLE" },
    })

    return { ok: true as const }
  })

  if ("error" in result) {
    const messages: Record<string, string> = {
      NOT_FOUND: "Бронирование не найдено.",
      ALREADY_CANCELLED: "Бронирование уже отменено.",
      COMPLETED: "Нельзя отменить завершённую тренировку.",
      STARTED: "Нельзя отменить бронирование после начала тренировки.",
    }
    return { error: messages[result.error as string] ?? "Ошибка отмены." }
  }

  revalidatePath("/account/bookings")
  return {}
}

export type ConfirmBookingState = {
  error?: string
}

export async function confirmBooking(
  _prevState: ConfirmBookingState,
  formData: FormData
): Promise<ConfirmBookingState> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const bookingId = String(formData.get("bookingId") ?? "")
  const rating = Number(formData.get("rating"))
  const comment = String(formData.get("comment") ?? "").trim()

  if (!bookingId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Укажите оценку от 1 до 5" }
  }

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    })

    if (!booking || booking.playerId !== userId) {
      return { error: "NOT_FOUND" as const }
    }

    if (booking.status !== "PAID" || booking.slot.endsAt > new Date()) {
      return { error: "NOT_ALLOWED" as const }
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED_CONFIRMED", confirmedAt: new Date() },
    })

    await tx.review.create({
      data: {
        bookingId,
        authorId: userId,
        coachId: booking.slot.coachId,
        rating,
        comment: comment || null,
      },
    })

    const stats = await tx.review.aggregate({
      where: { coachId: booking.slot.coachId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await tx.coachProfile.update({
      where: { id: booking.slot.coachId },
      data: {
        ratingAvg: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating,
      },
    })

    return { ok: true as const }
  })

  if ("error" in result) {
    if (result.error === "NOT_ALLOWED") {
      return {
        error:
          "Подтверждение доступно только после завершения оплаченной тренировки.",
      }
    }
    return { error: "Бронирование не найдено." }
  }

  revalidatePath("/account/bookings")
  return {}
}
