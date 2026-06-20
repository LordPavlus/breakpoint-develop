import { prisma } from "@/lib/prisma"
import { yookassaConfigured } from "@/lib/yookassa/client"
import { getPayment } from "@/lib/yookassa/payments"
import { applyPaymentStatus, findPaymentByYookassaId } from "@/lib/yookassa/webhook-handlers"

const EXPIRY_WINDOW_MS = 15 * 60 * 1000

async function cancelExpiredBooking(
  bookingId: string,
  slotId: string,
  paymentId: string | undefined
) {
  await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.updateMany({
      where: { id: bookingId, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED" },
    })

    if (updated.count === 0) return

    await tx.trainingSlot.updateMany({
      where: { id: slotId, status: "BOOKED" },
      data: { status: "AVAILABLE" },
    })

    if (paymentId) {
      await tx.payment.updateMany({
        where: { id: paymentId, status: "PENDING" },
        data: { status: "CANCELED" },
      })
    }
  })
}

// Находит брони со статусом PENDING_PAYMENT старше 15 минут. Если оплата
// настроена и getPayment() сообщает succeeded — синхронизирует статус
// (на случай пропущенного вебхука), иначе отменяет бронь и освобождает слот.
export async function expireStaleBookings(): Promise<{ expired: number; synced: number }> {
  const threshold = new Date(Date.now() - EXPIRY_WINDOW_MS)

  const bookings = await prisma.booking.findMany({
    where: { status: "PENDING_PAYMENT", createdAt: { lt: threshold } },
    include: { payment: true },
  })

  let expired = 0
  let synced = 0

  for (const booking of bookings) {
    if (booking.payment && yookassaConfigured) {
      const verified = await getPayment(booking.payment.yookassaId)

      if (verified.status === "succeeded") {
        const payment = await findPaymentByYookassaId(booking.payment.yookassaId)
        if (payment) {
          await applyPaymentStatus(payment, "succeeded")
          synced++
        }
        continue
      }
    }

    await cancelExpiredBooking(booking.id, booking.slotId, booking.payment?.id)
    expired++
  }

  return { expired, synced }
}
