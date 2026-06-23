import Link from "next/link"
import { CalendarRange, MapPin, Trophy, Users } from "lucide-react"
import type { Tournament } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"
import { ntrpLabels } from "@/lib/ntrp"

export const formatLabels: Record<Tournament["format"], string> = {
  GROUP_PLAYOFF: "Группы + плей-офф",
  SINGLE_ELIM: "Олимпийская система",
}

export const statusLabels: Record<Tournament["status"], string> = {
  DRAFT: "Черновик",
  REGISTRATION_OPEN: "Регистрация открыта",
  REGISTRATION_CLOSED: "Регистрация закрыта",
  GROUP_STAGE: "Групповой этап",
  PLAYOFF_STAGE: "Плей-офф",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
}

export const statusVariants: Record<
  Tournament["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  REGISTRATION_OPEN: "default",
  REGISTRATION_CLOSED: "secondary",
  GROUP_STAGE: "secondary",
  PLAYOFF_STAGE: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
}

const dayFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric" })
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long" })

export function formatDateRange(startsAt: Date, endsAt: Date | null) {
  if (!endsAt || startsAt.toDateString() === endsAt.toDateString()) {
    return `${dayFormatter.format(startsAt)} ${monthFormatter.format(startsAt)}`
  }
  if (startsAt.getMonth() === endsAt.getMonth()) {
    return `${dayFormatter.format(startsAt)}–${dayFormatter.format(endsAt)} ${monthFormatter.format(endsAt)}`
  }
  return `${dayFormatter.format(startsAt)} ${monthFormatter.format(startsAt)} – ${dayFormatter.format(endsAt)} ${monthFormatter.format(endsAt)}`
}

export function ntrpRangeLabel(
  min: Tournament["minNtrpLevel"],
  max: Tournament["maxNtrpLevel"]
) {
  if (min && max) return `NTRP ${ntrpLabels[min]}–${ntrpLabels[max]}`
  if (min) return `NTRP ${ntrpLabels[min]}+`
  if (max) return `NTRP до ${ntrpLabels[max]}`
  return "NTRP любое"
}

export function TournamentCard({
  tournament,
  registrationsCount = 0,
}: {
  tournament: Tournament
  registrationsCount?: number
}) {
  const ntrpRange = ntrpRangeLabel(tournament.minNtrpLevel, tournament.maxNtrpLevel)

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Trophy className="size-5" />
        </div>
        <CardTitle className="text-lg">{tournament.title}</CardTitle>
        <CardDescription>{ntrpRange}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-4" />
          {formatDateRange(tournament.startsAt, tournament.endsAt)}
        </div>
        {tournament.location && (
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            {tournament.location}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users className="size-4" />
          {formatLabels[tournament.format]}
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4" />
          Участников: {registrationsCount}
          {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ""}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground">
          {priceFormatter.format(tournament.entryFee.toNumber())}
        </span>
        <Button
          render={<Link href={`/tournaments/${tournament.id}`} />}
          nativeButton={false}
          variant="outline"
        >
          Подробнее
        </Button>
      </CardFooter>
    </Card>
  )
}
