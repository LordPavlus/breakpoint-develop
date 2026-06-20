import { prisma } from "@/lib/prisma"
import { formTournamentGroups } from "./grouping"
import { generateSingleElimBracket } from "./bracket"
import {
  refundCancelledTournamentRegistrations,
  type RefundCancelledTournamentResult,
} from "./refunds"

export type CloseRegistrationResult =
  | { status: "NOT_APPLICABLE" }
  | { status: "CANCELLED"; refunds: RefundCancelledTournamentResult }
  | { status: "GROUP_STAGE" }
  | { status: "PLAYOFF_STAGE" }

// Закрывает регистрацию турнира: если активных регистраций меньше
// minParticipants — турнир отменяется (с возвратом взносов через
// refundCancelledTournamentRegistrations), иначе формируются группы
// (GROUP_PLAYOFF) или сразу сетка плей-офф (SINGLE_ELIM).
export async function closeRegistrationAndAdvance(
  tournamentId: string
): Promise<CloseRegistrationResult> {
  const result = await prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } })

    if (!tournament || tournament.status !== "REGISTRATION_OPEN") {
      return { status: "NOT_APPLICABLE" as const }
    }

    const count = await tx.tournamentRegistration.count({
      where: { tournamentId, status: { not: "CANCELLED" } },
    })

    // Группы/сетка строятся только от 2 участников (formTournamentGroups,
    // generateSingleElimBracket рано выходят при <2) — без этого ограничения
    // minParticipants=0/1 оставлял бы турнир навечно в GROUP_STAGE без матчей.
    const minRequired = Math.max(tournament.minParticipants ?? 2, 2)

    if (count < minRequired) {
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: "CANCELLED" },
      })
      return { status: "CANCELLED" as const }
    }

    if (tournament.format === "GROUP_PLAYOFF") {
      await formTournamentGroups(tx, tournamentId)
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: "GROUP_STAGE" },
      })
      return { status: "GROUP_STAGE" as const }
    }

    await generateSingleElimBracket(tx, tournamentId)
    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "PLAYOFF_STAGE" },
    })
    return { status: "PLAYOFF_STAGE" as const }
  })

  if (result.status === "CANCELLED") {
    const refunds = await refundCancelledTournamentRegistrations(tournamentId)
    return { status: "CANCELLED", refunds }
  }

  return result
}
