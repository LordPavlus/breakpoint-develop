import { Trophy } from "lucide-react"
import type { Match, MatchStage } from "@prisma/client"

import { cn } from "@/lib/utils"
import { matchStageLabels, PLAYOFF_STAGE_ORDER } from "@/lib/tournament/bracket"

export type BracketMatch = Pick<
  Match,
  "id" | "stage" | "bracketPosition" | "status" | "winnerId" | "score"
> & {
  player1: { id: string; name: string | null } | null
  player2: { id: string; name: string | null } | null
}

function formatScore(score: Match["score"]): string | null {
  if (!Array.isArray(score) || score.length === 0) return null
  return score
    .map((set) => (Array.isArray(set) ? set.join("–") : null))
    .filter((set): set is string => Boolean(set))
    .join(", ")
}

export function PlayoffBracket({ matches }: { matches: BracketMatch[] }) {
  const stages = PLAYOFF_STAGE_ORDER.filter((stage) =>
    matches.some((match) => match.stage === stage)
  )

  if (stages.length === 0) return null

  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {stages.map((stage) => (
        <BracketColumn key={stage} stage={stage} matches={matches} />
      ))}
    </div>
  )
}

function BracketColumn({
  stage,
  matches,
}: {
  stage: MatchStage
  matches: BracketMatch[]
}) {
  const stageMatches = matches
    .filter((match) => match.stage === stage)
    .sort((a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0))

  return (
    <div className="flex min-w-48 flex-col gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        {matchStageLabels[stage]}
      </h3>
      <div className="flex flex-1 flex-col justify-around gap-4">
        {stageMatches.map((match) => {
          const score = formatScore(match.score)

          return (
            <div
              key={match.id}
              className="space-y-1 rounded-lg bg-card p-3 text-sm ring-1 ring-foreground/10"
            >
              <PlayerRow
                name={match.player1?.name}
                isWinner={Boolean(match.winnerId) && match.winnerId === match.player1?.id}
              />
              <PlayerRow
                name={match.player2?.name}
                isWinner={Boolean(match.winnerId) && match.winnerId === match.player2?.id}
              />
              {score && <p className="pt-1 text-xs text-muted-foreground">{score}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlayerRow({ name, isWinner }: { name?: string | null; isWinner: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 truncate",
        isWinner ? "font-semibold text-foreground" : "text-muted-foreground"
      )}
    >
      {isWinner && <Trophy className="size-3.5 shrink-0 text-primary" />}
      <span className="truncate">{name ?? "—"}</span>
    </div>
  )
}
