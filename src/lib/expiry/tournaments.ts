import { prisma } from "@/lib/prisma"
import { yookassaConfigured } from "@/lib/yookassa/client"
import { getPayment } from "@/lib/yookassa/payments"
import { applyPaymentStatus, findPaymentByYookassaId } from "@/lib/yookassa/webhook-handlers"

const EXPIRY_WINDOW_MS = 15 * 60 * 1000

async function cancelExpiredRegistration(registrationId: string, paymentId: string | undefined) {
  await prisma.$transaction(async (tx) => {
    const updated = await tx.tournamentRegistration.updateMany({
      where: { id: registrationId, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED" },
    })

    if (updated.count === 0) return

    if (paymentId) {
      await tx.payment.updateMany({
        where: { id: paymentId, status: "PENDING" },
        data: { status: "CANCELED" },
      })
    }
  })
}

// Находит регистрации на турниры со статусом PENDING_PAYMENT старше 15 минут.
// Если оплата настроена и getPayment() сообщает succeeded — синхронизирует
// статус (на случай пропущенного вебхука), иначе отменяет регистрацию
// (освобождая место — FULL считается по status != CANCELLED).
export async function expireStaleTournamentRegistrations(): Promise<{
  expired: number
  synced: number
}> {
  const threshold = new Date(Date.now() - EXPIRY_WINDOW_MS)

  const registrations = await prisma.tournamentRegistration.findMany({
    where: { status: "PENDING_PAYMENT", createdAt: { lt: threshold } },
    include: { payment: true },
  })

  let expired = 0
  let synced = 0

  for (const registration of registrations) {
    if (registration.payment && yookassaConfigured) {
      const verified = await getPayment(registration.payment.yookassaId)

      if (verified.status === "succeeded") {
        const payment = await findPaymentByYookassaId(registration.payment.yookassaId)
        if (payment) {
          await applyPaymentStatus(payment, "succeeded")
          synced++
        }
        continue
      }
    }

    await cancelExpiredRegistration(registration.id, registration.payment?.id)
    expired++
  }

  return { expired, synced }
}
