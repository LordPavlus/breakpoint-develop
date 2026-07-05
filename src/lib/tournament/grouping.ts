import type { Prisma } from "@prisma/client"

import { ntrpRank } from "@/lib/ntrp"

type Tx = Prisma.TransactionClient

const GROUP_NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// Делит зарегистрированных игроков на группы (целевой размер группы — 4 игрока)
// и распределяет их "змейкой" по уровню NTRP, чтобы сильные и слабые игроки
// были равномерно представлены в каждой группе. Для каждой группы создаёт
// нулевую турнирную таблицу и матчи круговой системы (round-robin).
export async function formTournamentGroups(tx: Tx, tournamentId: string) {
  const registrations = await tx.tournamentRegistration.findMany({
    where: { tournamentId, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "asc" },
  })

  if (registrations.length < 2) return

  const groupCount = Math.max(1, Math.round(registrations.length / 4))

  const sorted = [...registrations].sort(
    (a, b) => ntrpRank(b.ntrpLevelAtEntry) - ntrpRank(a.ntrpLevelAtEntry)
  )

  const groupedPlayerIds: string[][] = Array.from({ length: groupCount }, () => [])
  let groupIndex = 0
  let direction = 1
  for (const registration of sorted) {
    groupedPlayerIds[groupIndex].push(registration.playerId)
    if (groupCount > 1) {
      if (groupIndex + direction < 0 || groupIndex + direction >= groupCount) {
        direction *= -1
      } else {
        groupIndex += direction
      }
    }
  }

  for (let i = 0; i < groupCount; i++) {
    const group = await tx.tournamentGroup.create({
      data: { tournamentId, name: `Группа ${GROUP_NAMES[i]}` },
    })

    const playerIds = groupedPlayerIds[i]

    await tx.tournamentRegistration.updateMany({
      where: { tournamentId, playerId: { in: playerIds } },
      data: { groupId: group.id },
    })

    await tx.groupStanding.createMany({
      data: playerIds.map((playerId) => ({ groupId: group.id, playerId })),
    })

    for (let a = 0; a < playerIds.length; a++) {
      for (let b = a + 1; b < playerIds.length; b++) {
        await tx.match.create({
          data: {
            tournamentId,
            groupId: group.id,
            stage: "GROUP",
            player1Id: playerIds[a],
            player2Id: playerIds[b],
          },
        })
      }
    }
  }
}
