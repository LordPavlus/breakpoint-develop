import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import {
  capitalize,
  dateFormatter,
  priceFormatter,
} from "@/app/trainings/components/TrainingSlotCard"
import { ComputePayoutsButton } from "./ComputePayoutsButton"
import { MarkPayoutPaidButton } from "./MarkPayoutPaidButton"

type PayoutWithDetails = Prisma.PayoutGetPayload<{
  include: {
    booking: { include: { slot: true; player: true } }
    coach: { include: { user: true } }
  }
}>

export default async function AdminPayoutsPage() {
  const [pending, paid] = await Promise.all([
    prisma.payout.findMany({
      where: { status: "PENDING" },
      include: {
        booking: { include: { slot: true, player: true } },
        coach: { include: { user: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.payout.findMany({
      where: { status: "PAID" },
      include: {
        booking: { include: { slot: true, player: true } },
        coach: { include: { user: true } },
      },
      orderBy: { paidAt: "desc" },
      take: 20,
    }),
  ])

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">К выплате</h2>
          <ComputePayoutsButton />
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Нет выплат, ожидающих обработки.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((payout) => (
              <PayoutRow key={payout.id} payout={payout} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">История выплат</h2>
        {paid.length === 0 ? (
          <p className="text-sm text-muted-foreground">Выплат пока не было.</p>
        ) : (
          <div className="space-y-3">
            {paid.map((payout) => (
              <PayoutRow key={payout.id} payout={payout} readOnly />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function PayoutRow({
  payout,
  readOnly,
}: {
  payout: PayoutWithDetails
  readOnly?: boolean
}) {
  const coachName = payout.coach.user.name ?? payout.coach.user.email ?? "Тренер"
  const playerName =
    payout.booking.player.name ?? payout.booking.player.email ?? "Игрок"

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{coachName}</p>
          <p className="text-sm text-muted-foreground">
            {playerName} ·{" "}
            {capitalize(dateFormatter.format(payout.booking.slot.startsAt))}
          </p>
          {payout.coach.payoutInfo && (
            <p className="text-sm text-muted-foreground">
              Реквизиты: {payout.coach.payoutInfo}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <span className="font-semibold text-foreground">
            К выплате: {priceFormatter.format(payout.netAmount.toNumber())}
          </span>
          <span className="text-muted-foreground">
            Сумма: {priceFormatter.format(payout.grossAmount.toNumber())} ·
            комиссия {priceFormatter.format(payout.commissionAmount.toNumber())} (
            {payout.commissionPct.toNumber()}%)
          </span>
        </div>
      </div>

      {readOnly ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Выплачено{payout.paidAt ? ` ${dateFormatter.format(payout.paidAt)}` : ""}
          {payout.adminNote && ` · ${payout.adminNote}`}
        </p>
      ) : (
        <div className="mt-3">
          <MarkPayoutPaidButton payoutId={payout.id} />
        </div>
      )}
    </div>
  )
}
