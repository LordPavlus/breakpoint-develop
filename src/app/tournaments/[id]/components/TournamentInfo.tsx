import { CalendarRange, Clock, MapPin, Trophy, Users } from "lucide-react"
import type { Tournament } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"
import {
  formatDateRange,
  formatLabels,
  ntrpRangeLabel,
  statusLabels,
  statusVariants,
} from "../../components/TournamentCard"
import { RegisterButton } from "./RegisterButton"

const fullDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function TournamentInfo({
  tournament,
  registrationsCount,
  isAuthenticated,
  isRegistered,
  isPendingPayment,
  paymentUrl,
}: {
  tournament: Tournament
  registrationsCount: number
  isAuthenticated: boolean
  isRegistered: boolean
  isPendingPayment?: boolean
  paymentUrl?: string | null
}) {
  const ntrpRange = ntrpRangeLabel(tournament.minNtrpLevel, tournament.maxNtrpLevel)
  const registrationOpen =
    tournament.status === "REGISTRATION_OPEN" &&
    tournament.registrationDeadline > new Date()

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="inline-flex size-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Trophy className="size-6" />
          </div>
          <Badge variant={statusVariants[tournament.status]}>
            {statusLabels[tournament.status]}
          </Badge>
          {ntrpRange && <Badge variant="outline">{ntrpRange}</Badge>}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {tournament.title}
        </h1>
        <p className="mt-3 whitespace-pre-line text-muted-foreground">
          {tournament.description}
        </p>
      </div>

      <div className="grid gap-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarRange className="size-4" />
          {formatDateRange(tournament.startsAt, tournament.endsAt)}
        </div>
        {tournament.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            {tournament.location}
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          {formatLabels[tournament.format]}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4" />
          Регистрация до {fullDateFormatter.format(tournament.registrationDeadline)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div>
          <p className="text-sm text-muted-foreground">Взнос за участие</p>
          <p className="text-2xl font-semibold text-foreground">
            {priceFormatter.format(tournament.entryFee.toNumber())}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Участников</p>
          <p className="text-2xl font-semibold text-foreground">
            {registrationsCount}
            {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ""}
          </p>
        </div>
      </div>

      <RegisterButton
        tournamentId={tournament.id}
        title={tournament.title}
        entryFee={tournament.entryFee.toNumber()}
        isAuthenticated={isAuthenticated}
        isRegistered={isRegistered}
        registrationOpen={registrationOpen}
        isPendingPayment={isPendingPayment}
        paymentUrl={paymentUrl}
      />
    </div>
  )
}
