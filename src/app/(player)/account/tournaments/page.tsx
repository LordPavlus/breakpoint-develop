import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarRange, MapPin, Trophy } from "lucide-react"
import type { Prisma } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"
import {
  formatDateRange,
  statusLabels as tournamentStatusLabels,
  statusVariants as tournamentStatusVariants,
} from "@/app/tournaments/components/TournamentCard"

type RegistrationWithDetails = Prisma.TournamentRegistrationGetPayload<{
  include: {
    tournament: true
    group: true
    payment: { select: { confirmationUrl: true } }
  }
}>

const registrationStatusLabels: Record<RegistrationWithDetails["status"], string> = {
  PENDING_PAYMENT: "Ожидает оплаты",
  PAID: "Оплачено",
  CANCELLED: "Отменено",
  REFUNDED: "Возврат выполнен",
}

const registrationStatusVariants: Record<
  RegistrationWithDetails["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_PAYMENT: "secondary",
  PAID: "default",
  CANCELLED: "destructive",
  REFUNDED: "outline",
}

export default async function AccountTournamentsPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const registrations = await prisma.tournamentRegistration.findMany({
    where: { playerId: userId },
    include: {
      tournament: true,
      group: true,
      payment: { select: { confirmationUrl: true } },
    },
    orderBy: { tournament: { startsAt: "desc" } },
  })

  const now = new Date()
  const isUpcoming = (registration: RegistrationWithDetails) =>
    registration.tournament.startsAt > now &&
    registration.tournament.status !== "CANCELLED" &&
    registration.tournament.status !== "COMPLETED"

  const upcoming = registrations.filter(isUpcoming)
  const past = registrations.filter((registration) => !isUpcoming(registration))

  return (
    <div className="space-y-10">
      <RegistrationSection
        title="Предстоящие"
        registrations={upcoming}
        emptyText="Нет предстоящих турниров."
      />
      <RegistrationSection
        title="Прошедшие"
        registrations={past}
        emptyText="История пуста."
      />
    </div>
  )
}

function RegistrationSection({
  title,
  registrations,
  emptyText,
}: {
  title: string
  registrations: RegistrationWithDetails[]
  emptyText: string
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      {registrations.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {registrations.map((registration) => (
            <RegistrationRow key={registration.id} registration={registration} />
          ))}
        </div>
      )}
    </section>
  )
}

function RegistrationRow({ registration }: { registration: RegistrationWithDetails }) {
  const { tournament } = registration
  const fee = (registration.feeAtRegistration ?? tournament.entryFee).toNumber()

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Trophy className="size-4 text-primary" />
            {tournament.title}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange className="size-4" />
            {formatDateRange(tournament.startsAt, tournament.endsAt)}
          </p>
          {tournament.location && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {tournament.location}
            </p>
          )}
          {registration.group && (
            <p className="text-sm text-muted-foreground">{registration.group.name}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-semibold text-foreground">
            {priceFormatter.format(fee)}
          </span>
          <Badge variant={registrationStatusVariants[registration.status]}>
            {registrationStatusLabels[registration.status]}
          </Badge>
          <Badge variant={tournamentStatusVariants[tournament.status]}>
            {tournamentStatusLabels[tournament.status]}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {registration.status === "PENDING_PAYMENT" && registration.payment?.confirmationUrl && (
          <Button
            render={<Link href={registration.payment.confirmationUrl} />}
            nativeButton={false}
            size="sm"
          >
            Продолжить оплату
          </Button>
        )}
        <Button
          render={<Link href={`/tournaments/${tournament.id}`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          Подробнее
        </Button>
      </div>
    </div>
  )
}
