import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { generatePlayoffBracketFromGroups } from "./bracket"

export type RecordMatchResultResult =
  | { status: "OK"; tournamentId: string }
  | { status: "NOT_FOUND" }
  | { status: "ALREADY_COMPLETED" }
  | { status: "INVALID_SETS" }

// Записывает результат матча: счёт по сетам + победитель. Для группового
// матча обновляет GroupStanding обоих игроков и, если это был последний матч
// группы, генерирует сетку плей-офф по итогам групп. Для матча плей-офф
// продвигает победителя в nextMatch; завершение FINAL переводит турнир в
// COMPLETED.
export async function recordMatchResult(
  matchId: string,
  sets: [number, number][]
): Promise<RecordMatchResultResult> {
  if (sets.length === 0) return { status: "INVALID_SETS" }

  for (const [p1, p2] of sets) {
    if (!Number.isInteger(p1) || !Number.isInteger(p2) || p1 < 0 || p2 < 0 || p1 === p2) {
      return { status: "INVALID_SETS" }
    }
  }

  const setsWon1 = sets.filter(([a, b]) => a > b).length
  const setsWon2 = sets.length - setsWon1

  if (setsWon1 === setsWon2) return { status: "INVALID_SETS" }

  return prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({ where: { id: matchId } })

    if (!match || !match.player1Id || !match.player2Id) {
      return { status: "NOT_FOUND" as const }
    }

    if (match.status === "COMPLETED") {
      return { status: "ALREADY_COMPLETED" as const }
    }

    const player1Wins = setsWon1 > setsWon2
    const winnerId = player1Wins ? match.player1Id : match.player2Id
    const loserId = player1Wins ? match.player2Id : match.player1Id
    const winnerSets = player1Wins ? setsWon1 : setsWon2
    const loserSets = player1Wins ? setsWon2 : setsWon1

    await tx.match.update({
      where: { id: matchId },
      data: {
        score: sets as unknown as Prisma.InputJsonValue,
        winnerId,
        status: "COMPLETED",
      },
    })

    if (match.stage === "GROUP" && match.groupId) {
      await tx.groupStanding.update({
        where: { groupId_playerId: { groupId: match.groupId, playerId: winnerId } },
        data: {
          played: { increment: 1 },
          wins: { increment: 1 },
          points: { increment: 1 },
          setsWon: { increment: winnerSets },
          setsLost: { increment: loserSets },
        },
      })

      await tx.groupStanding.update({
        where: { groupId_playerId: { groupId: match.groupId, playerId: loserId } },
        data: {
          played: { increment: 1 },
          losses: { increment: 1 },
          setsWon: { increment: loserSets },
          setsLost: { increment: winnerSets },
        },
      })

      const remaining = await tx.match.count({
        where: {
          tournamentId: match.tournamentId,
          stage: "GROUP",
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      })

      if (remaining === 0) {
        await generatePlayoffBracketFromGroups(tx, match.tournamentId)
        await tx.tournament.update({
          where: { id: match.tournamentId },
          data: { status: "PLAYOFF_STAGE" },
        })
      }
    } else if (match.nextMatchId) {
      const slot = (match.bracketPosition ?? 0) % 2 === 0 ? "player1Id" : "player2Id"
      await tx.match.update({
        where: { id: match.nextMatchId },
        data: { [slot]: winnerId },
      })
    }

    if (match.stage === "FINAL") {
      await tx.tournament.update({
        where: { id: match.tournamentId },
        data: { status: "COMPLETED" },
      })
    }

    return { status: "OK" as const, tournamentId: match.tournamentId }
  })
}
