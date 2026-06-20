import { redirect } from "next/navigation"
import { Star } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAdminSettings } from "@/lib/settings"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"

export default async function CoachDashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const coach = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId },
    include: { user: true },
  })

  const now = new Date()

  const [upcomingSlots, activeBookings, completedBookings, earningsAgg, settings] =
    await Promise.all([
      prisma.trainingSlot.count({
        where: {
          coachId: coach.id,
          startsAt: { gt: now },
          status: { in: ["AVAILABLE", "BOOKED"] },
        },
      }),
      prisma.booking.count({
        where: { slot: { coachId: coach.id }, status: { in: ["PENDING_PAYMENT", "PAID"] } },
      }),
      prisma.booking.count({
        where: { slot: { coachId: coach.id }, status: "COMPLETED_CONFIRMED" },
      }),
      prisma.booking.aggregate({
        where: { slot: { coachId: coach.id }, status: "COMPLETED_CONFIRMED" },
        _sum: { priceAtBooking: true },
      }),
      getAdminSettings(),
    ])

  const grossEarnings = earningsAgg._sum.priceAtBooking?.toNumber() ?? 0
  const commissionPct = settings.platformCommissionPct.toNumber()
  const netEarnings = grossEarnings * (1 - commissionPct / 100)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {coach.user.name ?? "Тренер"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {coach.ratingAvg != null && (
            <div className="flex items-center gap-1 text-foreground">
              <Star className="size-4 fill-primary text-primary" />
              {coach.ratingAvg.toFixed(1)}
              <span className="text-muted-foreground">
                ({coach.ratingCount} отзывов)
              </span>
            </div>
          )}
          {coach.bio && <p>{coach.bio}</p>}
          {coach.specialization.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {coach.specialization.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          )}
          {coach.payoutInfo && (
            <p>
              <span className="text-foreground">Реквизиты для выплат:</span>{" "}
              {coach.payoutInfo}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Предстоящие слоты" value={String(upcomingSlots)} />
        <StatCard label="Активные брони" value={String(activeBookings)} />
        <StatCard label="Завершено тренировок" value={String(completedBookings)} />
        <StatCard
          label="К выплате (после комиссии)"
          value={priceFormatter.format(netEarnings)}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Заработано всего: {priceFormatter.format(grossEarnings)} · комиссия
        платформы {commissionPct}%
      </p>
    </div>
  )
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
