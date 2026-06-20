import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"

export default async function AdminOverviewPage() {
  const [
    playerCount,
    coachCount,
    adminCount,
    totalBookings,
    activeBookings,
    completedBookings,
    revenueAgg,
    pendingPayoutsAgg,
    pendingPayoutsCount,
    activeSlots,
    occupiedSlots,
    nonCancelledBookings,
    paidBookings,
    nonCancelledRegistrations,
    paidRegistrations,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.user.count({ where: { role: "COACH" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: { in: ["PENDING_PAYMENT", "PAID"] } } }),
    prisma.booking.count({ where: { status: "COMPLETED_CONFIRMED" } }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    prisma.payout.aggregate({
      where: { status: "PENDING" },
      _sum: { netAmount: true },
    }),
    prisma.payout.count({ where: { status: "PENDING" } }),
    prisma.trainingSlot.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.trainingSlot.count({ where: { status: { in: ["BOOKED", "COMPLETED"] } } }),
    prisma.booking.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.booking.count({ where: { status: { in: ["PAID", "COMPLETED_CONFIRMED"] } } }),
    prisma.tournamentRegistration.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.tournamentRegistration.count({ where: { status: { in: ["PAID", "REFUNDED"] } } }),
  ])

  const revenue = revenueAgg._sum.amount?.toNumber() ?? 0
  const pendingPayoutsSum = pendingPayoutsAgg._sum.netAmount?.toNumber() ?? 0

  const occupancyRate = formatPercent(occupiedSlots, activeSlots)
  const bookingConversion = formatPercent(paidBookings, nonCancelledBookings)
  const tournamentConversion = formatPercent(paidRegistrations, nonCancelledRegistrations)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Игроки" value={String(playerCount)} />
        <StatCard label="Тренеры" value={String(coachCount)} />
        <StatCard label="Админы" value={String(adminCount)} />
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Всего бронирований" value={String(totalBookings)} />
        <StatCard label="Активные" value={String(activeBookings)} />
        <StatCard label="Завершено" value={String(completedBookings)} />
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Выручка (оплачено)" value={priceFormatter.format(revenue)} />
        <StatCard
          label="К выплате тренерам"
          value={priceFormatter.format(pendingPayoutsSum)}
        />
        <StatCard label="Выплат в ожидании" value={String(pendingPayoutsCount)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Аналитика</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Заполняемость тренировок" value={occupancyRate} />
          <StatCard label="Конверсия оплаты тренировок" value={bookingConversion} />
          <StatCard label="Конверсия турнирных взносов" value={tournamentConversion} />
        </div>
      </section>
    </div>
  )
}

function formatPercent(part: number, total: number): string {
  if (total === 0) return "—"
  return `${Math.round((part / total) * 100)}%`
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
