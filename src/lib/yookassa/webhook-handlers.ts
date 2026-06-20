import { Prisma } from "@prisma/client"
import type { Booking, Payment, TournamentRegistration, TrainingSlot, User } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { sendBookingPaidEmail } from "@/lib/email/send-booking-paid"
import { sendTournamentRegistrationPaidEmail } from "@/lib/email/send-tournament-registration-paid"
import { sendPushToUser } from "@/lib/push/send"
import { getPayment } from "@/lib/yookassa/payments"
import type { YookassaPaymentStatus } from "@/types/yookassa"

export type PaymentWithRelations = Payment & {
  payer: Pick<User, "email">
  booking:
    | (Booking & {
        slot: TrainingSlot & { coach: { user: Pick<User, "name"> } }
      })
    | null
  tournamentRegistration:
    | (TournamentRegistration & {
        tournament: { title: string; startsAt: Date; location: string | null }
      })
    | null
}

const paymentInclude = {
  payer: { select: { email: true } },
  booking: {
    include: {
      slot: { include: { coach: { include: { user: { select: { name: true } } } } } },
    },
  },
  tournamentRegistration: {
    include: { tournament: { select: { title: true, startsAt: true, location: true } } },
  },
} satisfies Prisma.PaymentInclude

export async function findPaymentByYookassaId(
  yookassaId: string
): Promise<PaymentWithRelations | null> {
  return prisma.payment.findUnique({
    where: { yookassaId },
    include: paymentInclude,
  })
}

// Применяет проверенный (через getPayment) статус оплаты ЮKassa к Payment и
// связанному Booking/TournamentRegistration. Идемпотентна — повторный вызов
// с тем же статусом ничего не меняет.
export async function applyPaymentStatus(
  payment: PaymentWithRelations,
  verifiedStatus: YookassaPaymentStatus
): Promise<"SUCCEEDED" | "CANCELED" | "NO_CHANGE"> {
  if (verifiedStatus === "succeeded") {
    if (payment.status === "SUCCEEDED") return "NO_CHANGE"

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCEEDED" },
      })

      if (payment.bookingId) {
        await tx.booking.updateMany({
          where: { id: payment.bookingId, status: "PENDING_PAYMENT" },
          data: { status: "PAID" },
        })
      }

      if (payment.tournamentRegistrationId) {
        await tx.tournamentRegistration.updateMany({
          where: { id: payment.tournamentRegistrationId, status: "PENDING_PAYMENT" },
          data: { status: "PAID" },
        })
      }
    })

    await sendPaymentConfirmedNotifications(payment)
    return "SUCCEEDED"
  }

  if (verifiedStatus === "canceled") {
    if (payment.status === "CANCELED") return "NO_CHANGE"

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "CANCELED" },
      })

      if (payment.booking) {
        const updated = await tx.booking.updateMany({
          where: { id: payment.booking.id, status: "PENDING_PAYMENT" },
          data: { status: "CANCELLED" },
        })

        if (updated.count > 0) {
          await tx.trainingSlot.updateMany({
            where: { id: payment.booking.slotId, status: "BOOKED" },
            data: { status: "AVAILABLE" },
          })
        }
      }

      if (payment.tournamentRegistrationId) {
        await tx.tournamentRegistration.updateMany({
          where: { id: payment.tournamentRegistrationId, status: "PENDING_PAYMENT" },
          data: { status: "CANCELLED" },
        })
      }
    })

    return "CANCELED"
  }

  // pending / waiting_for_capture — промежуточные статусы, ничего не делаем
  return "NO_CHANGE"
}

async function sendPaymentConfirmedNotifications(payment: PaymentWithRelations) {
  const email = payment.payer.email

  if (payment.booking) {
    if (email) {
      await sendBookingPaidEmail(email, {
        coachName: payment.booking.slot.coach.user.name ?? "тренер",
        startsAt: payment.booking.slot.startsAt,
        location: payment.booking.slot.location,
      })
    }

    await sendPushToUser(payment.payerId, {
      title: "Оплата прошла успешно",
      body: `Тренировка с ${payment.booking.slot.coach.user.name ?? "тренером"} оплачена`,
      url: "/account/bookings",
    })
  }

  if (payment.tournamentRegistration) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    if (email) {
      await sendTournamentRegistrationPaidEmail(email, {
        title: payment.tournamentRegistration.tournament.title,
        startsAt: payment.tournamentRegistration.tournament.startsAt,
        location: payment.tournamentRegistration.tournament.location,
        tournamentUrl: `${baseUrl}/tournaments/${payment.tournamentRegistration.tournamentId}`,
      })
    }

    await sendPushToUser(payment.payerId, {
      title: "Регистрация на турнир оплачена",
      body: `Взнос на турнир «${payment.tournamentRegistration.tournament.title}» оплачен`,
      url: `/tournaments/${payment.tournamentRegistration.tournamentId}`,
    })
  }
}

interface YookassaNotification {
  event: string
  object: { id: string }
}

function isYookassaNotification(value: unknown): value is YookassaNotification {
  if (!value || typeof value !== "object") return false
  const obj = value as Record<string, unknown>
  if (typeof obj.event !== "string") return false
  if (!obj.object || typeof obj.object !== "object") return false
  return typeof (obj.object as Record<string, unknown>).id === "string"
}

const HANDLED_EVENTS = new Set(["payment.succeeded", "payment.canceled"])

export type WebhookResult =
  | { status: "OK"; result: "SUCCEEDED" | "CANCELED" | "NO_CHANGE" }
  | { status: "DUPLICATE" }
  | { status: "IGNORED"; reason: "invalid_payload" | "unhandled_event" | "unknown_payment" }

// Обрабатывает вебхук ЮKassa. Статус оплаты НЕ берётся из тела запроса
// напрямую (ЮKassa не подписывает вебхуки) — после идемпотентной записи
// события всегда дополнительно запрашивается getPayment() для проверки
// реального статуса в API ЮKassa.
export async function handleYookassaWebhook(rawPayload: unknown): Promise<WebhookResult> {
  if (!isYookassaNotification(rawPayload)) {
    return { status: "IGNORED", reason: "invalid_payload" }
  }

  const { event, object } = rawPayload

  try {
    await prisma.webhookEvent.create({
      data: {
        source: "yookassa",
        eventType: event,
        externalId: object.id,
        payload: rawPayload as unknown as Prisma.InputJsonValue,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "DUPLICATE" }
    }
    throw error
  }

  if (!HANDLED_EVENTS.has(event)) {
    return { status: "IGNORED", reason: "unhandled_event" }
  }

  const payment = await findPaymentByYookassaId(object.id)
  if (!payment) {
    return { status: "IGNORED", reason: "unknown_payment" }
  }

  const verified = await getPayment(object.id)
  const result = await applyPaymentStatus(payment, verified.status)

  return { status: "OK", result }
}
