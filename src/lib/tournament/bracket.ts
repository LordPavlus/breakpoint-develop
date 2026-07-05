import type { MatchStage, Prisma } from "@prisma/client"

import { ntrpRank } from "@/lib/ntrp"

type Tx = Prisma.TransactionClient

// Стадии плей-офф от первого раунда до финала для каждого размера сетки.
// MatchStage не содержит названий для сеток крупнее 32 — это и есть
// практический потолок размера плей-офф.
const BRACKET_STAGES: Record<number, MatchStage[]> = {
  2: ["FINAL"],
  4: ["SEMIFINAL", "FINAL"],
  8: ["QUARTERFINAL", "SEMIFINAL", "FINAL"],
  16: ["ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "FINAL"],
  32: ["ROUND_OF_32", "ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "FINAL"],
}

export const PLAYOFF_STAGE_ORDER: MatchStage[] = [
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTERFINAL",
  "SEMIFINAL",
  "FINAL",
]

export const matchStageLabels: Record<MatchStage, string> = {
  GROUP: "Группа",
  ROUND_OF_32: "1/16 финала",
  ROUND_OF_16: "1/8 финала",
  QUARTERFINAL: "Четвертьфинал",
  SEMIFINAL: "Полуфинал",
  FINAL: "Финал",
  THIRD_PLACE: "Матч за 3-е место",
}

// Наименьшая степень двойки >= participants, не больше cap (ограничение MatchStage).
export function nextBracketSize(participants: number, cap = 32): number {
  let size = 2
  while (size < participants && size < cap) size *= 2
  return Math.min(size, cap)
}

// Классический порядок сидирования: seed 1 и seed 2 могут встретиться только
// в финале, seed 1 и seed 3/4 — не раньше полуфинала, и так далее.
function seedOrder(size: number): number[] {
  if (size <= 1) return [1]
  let order = [1, 2]
  while (order.length < size) {
    const total = order.length * 2
    const next: number[] = []
    for (const seed of order) {
      next.push(seed, total + 1 - seed)
    }
    order = next
  }
  return order
}

// Строит дерево плей-офф для заданного посева (от сильного к слабому, `null` —
// технический проход/бай). Длина `seeds` должна быть степенью двойки.
// Сначала создаются раунды от финала к первому (чтобы можно было сослаться
// на nextMatchId), затем технические победы первого раунда (бай) сразу
// продвигаются во второй раунд.
export async function buildEliminationBracket(
  tx: Tx,
  tournamentId: string,
  seeds: (string | null)[]
) {
  const size = seeds.length
  const stages = BRACKET_STAGES[size]
  if (!stages) return

  const order = seedOrder(size)

  let nextRound: { id: string }[] = []

  for (let round = stages.length - 1; round >= 0; round--) {
    const matchCount = size / 2 ** (round + 1)
    const currentRound: { id: string }[] = []

    for (let pos = 0; pos < matchCount; pos++) {
      const isFirstRound = round === 0
      const player1Id = isFirstRound ? seeds[order[2 * pos] - 1] : null
      const player2Id = isFirstRound ? seeds[order[2 * pos + 1] - 1] : null

      let status: "SCHEDULED" | "WALKOVER" = "SCHEDULED"
      let winnerId: string | null = null

      if (isFirstRound) {
        if (player1Id && !player2Id) {
          status = "WALKOVER"
          winnerId = player1Id
        } else if (!player1Id && player2Id) {
          status = "WALKOVER"
          winnerId = player2Id
        }
      }

      const match = await tx.match.create({
        data: {
          tournamentId,
          stage: stages[round],
          bracketPosition: pos,
          nextMatchId: nextRound[Math.floor(pos / 2)]?.id ?? null,
          player1Id,
          player2Id,
          status,
          winnerId,
        },
      })

      currentRound.push(match)
    }

    nextRound = currentRound
  }

  const firstRoundByes = await tx.match.findMany({
    where: { tournamentId, stage: stages[0], status: "WALKOVER" },
  })

  for (const match of firstRoundByes) {
    if (!match.nextMatchId || !match.winnerId) continue
    const slot = (match.bracketPosition ?? 0) % 2 === 0 ? "player1Id" : "player2Id"
    await tx.match.update({
      where: { id: match.nextMatchId },
      data: { [slot]: match.winnerId },
    })
  }
}

// Сетка плей-офф для формата SINGLE_ELIM: посев по убыванию NTRP, верхние
// сеяные получают технический проход (бай), если число участников не
// является степенью двойки.
export async function generateSingleElimBracket(tx: Tx, tournamentId: string) {
  const registrations = await tx.tournamentRegistration.findMany({
    where: { tournamentId, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "asc" },
  })

  if (registrations.length < 2) return

  const sorted = [...registrations].sort(
    (a, b) => ntrpRank(b.ntrpLevelAtEntry) - ntrpRank(a.ntrpLevelAtEntry)
  )

  const size = nextBracketSize(sorted.length)
  const seeds: (string | null)[] = Array.from(
    { length: size },
    (_, i) => sorted[i]?.playerId ?? null
  )

  await buildEliminationBracket(tx, tournamentId, seeds)
}

// Сетка плей-офф по итогам группового этапа: из каждой группы выходят
// 1-2 лучших игрока (по очкам, затем по разнице/количеству выигранных
// сетов). Финалисты групп сеются как лучшая половина сетки, занявшие
// вторые места — как вторая половина, чтобы избежать повторов из одной
// группы в первом раунде.
export async function generatePlayoffBracketFromGroups(tx: Tx, tournamentId: string) {
  const groups = await tx.tournamentGroup.findMany({
    where: { tournamentId },
    orderBy: { name: "asc" },
    include: { standings: true },
  })

  if (groups.length === 0) return

  const rank = (s: { points: number; setsWon: number; setsLost: number }) =>
    [s.points, s.setsWon - s.setsLost, s.setsWon]

  const compare = (
    a: { points: number; setsWon: number; setsLost: number },
    b: { points: number; setsWon: number; setsLost: number }
  ) => {
    const ra = rank(a)
    const rb = rank(b)
    for (let i = 0; i < ra.length; i++) {
      if (ra[i] !== rb[i]) return rb[i] - ra[i]
    }
    return 0
  }

  const advancePerGroup = groups.every((g) => g.standings.length >= 2) ? 2 : 1

  const qualifiers: string[] = []
  for (let place = 0; place < advancePerGroup; place++) {
    const placeFinishers = groups
      .map((g) => [...g.standings].sort(compare)[place])
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .sort(compare)
      .map((s) => s.playerId)
    qualifiers.push(...placeFinishers)
  }

  const size = nextBracketSize(qualifiers.length)
  const seeds: (string | null)[] = Array.from(
    { length: size },
    (_, i) => qualifiers[i] ?? null
  )

  await buildEliminationBracket(tx, tournamentId, seeds)
}
