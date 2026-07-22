import { notFound } from "next/navigation"
import Link from "next/link"
import type { Match } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"
import {
  formatDateRange,
  formatLabels,
  statusLabels,
  statusVariants,
} from "@/app/tournaments/components/TournamentCard"
import { matchStageLabels } from "@/lib/tournament/bracket"
import { GroupStandingsTable } from "@/app/tournaments/[id]/components/GroupStandingsTable"
import { PlayoffBracket } from "@/app/tournaments/[id]/components/PlayoffBracket"
import { CloseRegistrationButton } from "./CloseRegistrationButton"
import { MatchResultForm } from "./MatchResultForm"

type MatchWithPlayers = Pick<
  Match,
  "id" | "stage" | "bracketPosition" | "status" | "winnerId" | "score" | "player1Id" | "player2Id"
> & {
  player1: { id: string; name: string | null } | null
  player2: { id: string; name: string | null } | null
  group: { name: string } | null
}

function formatScore(score: Match["score"]): string | null {
  if (!Array.isArray(score) || score.length === 0) return null
  return score
    .map((set) => (Array.isArray(set) ? set.join("–") : null))
    .filter((set): set is string => Boolean(set))
    .join(", ")
}

function MatchRow({ match }: { match: MatchWithPlayers }) {
  const score = formatScore(match.score)
  const player1Name = match.player1?.name ?? "—"
  const player2Name = match.player2?.name ?? "—"

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card p-3 text-sm ring-1 ring-foreground/10">
      <div>
        <p className="text-xs text-muted-foreground">
          {matchStageLabels[match.stage]}
          {match.group ? ` · ${match.group.name}` : ""}
        </p>
        <p className="font-medium text-foreground">
          {player1Name} — {player2Name}
        </p>
        {score && <p className="text-xs text-muted-foreground">{score}</p>}
      </div>
      {match.status === "COMPLETED" ? (
        <Badge variant="outline">Завершён</Badge>
      ) : match.status === "WALKOVER" ? (
        <Badge variant="secondary">Технический проход</Badge>
      ) : match.player1Id && match.player2Id ? (
        <MatchResultForm
          matchId={match.id}
          player1Name={player1Name}
          player2Name={player2Name}
        />
      ) : (
        <Badge variant="outline">Ожидание соперников</Badge>
      )}
    </div>
  )
}

export default async function AdminTournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const tournament = await prisma.tournament.findUnique({ where: { id } })
  if (!tournament) {
    notFound()
  }

  const [registrationsCount, groups, matches] = await Promise.all([
    prisma.tournamentRegistration.count({
      where: { tournamentId: id, status: { not: "CANCELLED" } },
    }),
    prisma.tournamentGroup.findMany({
      where: { tournamentId: id },
      orderBy: { name: "asc" },
      include: {
        standings: { include: { player: { select: { name: true } } } },
      },
    }),
    prisma.match.findMany({
      where: { tournamentId: id },
      orderBy: [{ stage: "asc" }, { bracketPosition: "asc" }],
      include: {
        player1: { select: { id: true, name: true } },
        player2: { select: { id: true, name: true } },
        group: { select: { name: true } },
      },
    }),
  ])

  const groupMatches = matches.filter((match) => match.stage === "GROUP")
  const playoffMatches = matches.filter((match) => match.stage !== "GROUP")

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {tournament.title}
            </h1>
            <Badge variant={statusVariants[tournament.status]}>
              {statusLabels[tournament.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDateRange(tournament.startsAt, tournament.endsAt)} ·{" "}
            {formatLabels[tournament.format]} ·{" "}
            {priceFormatter.format(tournament.entryFee.toNumber())} ·
            регистраций: {registrationsCount}
            {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/admin/tournaments/${id}/edit`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Редактировать
          </Button>
          {tournament.status === "REGISTRATION_OPEN" && (
            <CloseRegistrationButton tournamentId={tournament.id} />
          )}
        </div>
      </div>

      {groups.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Групповой этап
          </h2>
          <GroupStandingsTable groups={groups} />
          <div className="space-y-2">
            {groupMatches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {playoffMatches.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Плей-офф
          </h2>
          <PlayoffBracket matches={playoffMatches} />
          <div className="space-y-2">
            {playoffMatches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
