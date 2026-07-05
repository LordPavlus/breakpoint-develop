import { prisma } from "@/lib/prisma"
import { sendTournamentCancelledEmail } from "@/lib/email/send-tournament-cancelled"
import { sendPushToUser } from "@/lib/push/send"
import { yookassaConfigured } from "@/lib/yookassa/client"
import { createRefund } from "@/lib/yookassa/refunds"

export type RefundCancelledTournamentResult = {
  refunded: number
  cancelled: number
  manualReviewNeeded: number
}

// Обрабатывает регистрации отменённого турнира: оплаченные (PAID, Payment
// SUCCEEDED) возвращаются через Refund API ЮKassa и переводятся в REFUNDED;
// неоплаченные (PENDING_PAYMENT) — просто отменяются. Если оплата успешна,
// но ЮKassa не настроена (нет кредов для возврата) — регистрация не
// трогается, нужна ручная проверка админом.
export async function refundCancelledTournamentRegistrations(
  tournamentId: string
): Promise<RefundCancelledTournamentResult> {
  const registrations = await prisma.tournamentRegistration.findMany({
    where: { tournamentId, status: { in: ["PENDING_PAYMENT", "PAID"] } },
    include: {
      payment: true,
      player: { select: { email: true } },
      tournament: { select: { title: true } },
    },
  })

  let refunded = 0
  let cancelled = 0
  let manualReviewNeeded = 0

  for (const registration of registrations) {
    const succeededPayment =
      registration.payment?.status === "SUCCEEDED" ? registration.payment : null

    if (succeededPayment) {
      if (!yookassaConfigured) {
        manualReviewNeeded++
        continue
      }

      await createRefund({
        paymentId: succeededPayment.yookassaId,
        amount: succeededPayment.amount.toNumber(),
        idempotenceKey: `refund-${succeededPayment.id}`,
      })

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: succeededPayment.id },
          data: { status: "REFUNDED" },
        })
        await tx.tournamentRegistration.update({
          where: { id: registration.id },
          data: { status: "REFUNDED" },
        })
      })
      refunded++
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.tournamentRegistration.update({
          where: { id: registration.id },
          data: { status: "CANCELLED" },
        })

        if (registration.payment?.status === "PENDING") {
          await tx.payment.update({
            where: { id: registration.payment.id },
            data: { status: "CANCELED" },
          })
        }
      })
      cancelled++
    }

    const email = registration.player.email
    if (email) {
      await sendTournamentCancelledEmail(email, {
        title: registration.tournament.title,
        refunded: Boolean(succeededPayment),
      })
    }

    await sendPushToUser(registration.playerId, {
      title: "Турнир отменён",
      body: succeededPayment
        ? `Турнир «${registration.tournament.title}» отменён, взнос будет возвращён`
        : `Турнир «${registration.tournament.title}» отменён`,
      url: "/account/tournaments",
    })
  }

  return { refunded, cancelled, manualReviewNeeded }
}
