import { redirect } from "next/navigation"
import type { Prisma } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  capitalize,
  dateFormatter,
  priceFormatter,
} from "@/app/trainings/components/TrainingSlotCard"

type PayoutWithBooking = Prisma.PayoutGetPayload<{
  include: { booking: { include: { slot: true } } }
}>

const statusLabels: Record<PayoutWithBooking["status"], string> = {
  PENDING: "Ожидает выплаты",
  PAID: "Выплачено",
  CANCELED: "Отменено",
}

const statusVariants: Record<
  PayoutWithBooking["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  PAID: "default",
  CANCELED: "destructive",
}

export default async function CoachPayoutsPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const coach = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId },
  })

  const payouts = await prisma.payout.findMany({
    where: { coachId: coach.id },
    include: { booking: { include: { slot: true } } },
    orderBy: { createdAt: "desc" },
  })

  if (payouts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Выплат пока нет. Они появляются после подтверждения тренировок
        игроками и расчёта администратором.
      </p>
    )
  }

  const totalPending = payouts
    .filter((payout) => payout.status === "PENDING")
    .reduce((sum, payout) => sum + payout.netAmount.toNumber(), 0)

  return (
    <div className="space-y-6">
      {totalPending > 0 && (
        <p className="text-sm text-muted-foreground">
          К выплате:{" "}
          <span className="font-semibold text-foreground">
            {priceFormatter.format(totalPending)}
          </span>
        </p>
      )}
      <div className="space-y-3">
        {payouts.map((payout) => (
          <PayoutRow key={payout.id} payout={payout} />
        ))}
      </div>
    </div>
  )
}

function PayoutRow({ payout }: { payout: PayoutWithBooking }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {capitalize(dateFormatter.format(payout.booking.slot.startsAt))}
          </p>
          <p className="text-sm text-muted-foreground">
            {payout.booking.slot.location}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <span className="font-semibold text-foreground">
            {priceFormatter.format(payout.netAmount.toNumber())}
          </span>
          <span className="text-muted-foreground">
            Сумма {priceFormatter.format(payout.grossAmount.toNumber())} ·
            комиссия {priceFormatter.format(payout.commissionAmount.toNumber())} (
            {payout.commissionPct.toNumber()}%)
          </span>
          <Badge variant={statusVariants[payout.status]}>
            {statusLabels[payout.status]}
          </Badge>
        </div>
      </div>
      {payout.status === "PAID" && payout.paidAt && (
        <p className="mt-2 text-sm text-muted-foreground">
          Выплачено {dateFormatter.format(payout.paidAt)}
          {payout.adminNote && ` · ${payout.adminNote}`}
        </p>
      )}
    </div>
  )
}
