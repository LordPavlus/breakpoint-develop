import { prisma } from "@/lib/prisma"
import { sendTournamentReminderEmail } from "@/lib/email/send-tournament-reminder"
import { sendPushToUser } from "@/lib/push/send"

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
})

// Находит турниры, которые начнутся в ближайшие 24ч и для которых напоминание
// ещё не отправлено, и рассылает его всем активным участникам.
export async function sendDueTournamentReminders(): Promise<{ sent: number; tournaments: number }> {
  const now = new Date()
  const threshold = new Date(now.getTime() + REMINDER_WINDOW_MS)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const tournaments = await prisma.tournament.findMany({
    where: {
      reminderSentAt: null,
      status: { notIn: ["DRAFT", "CANCELLED", "COMPLETED"] },
      startsAt: { gt: now, lte: threshold },
    },
    include: {
      registrations: {
        where: { status: { not: "CANCELLED" } },
        include: { player: { select: { email: true } } },
      },
    },
  })

  let sent = 0
  for (const tournament of tournaments) {
    for (const registration of tournament.registrations) {
      if (registration.player.email) {
        await sendTournamentReminderEmail(registration.player.email, {
          title: tournament.title,
          startsAt: tournament.startsAt,
          location: tournament.location,
          tournamentUrl: `${baseUrl}/tournaments/${tournament.id}`,
        })
        sent++
      }

      await sendPushToUser(registration.playerId, {
        title: "Напоминание о турнире",
        body: `Завтра в ${timeFormatter.format(tournament.startsAt)} старт турнира «${tournament.title}»`,
        url: `/tournaments/${tournament.id}`,
      })
    }

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { reminderSentAt: now },
    })
  }

  return { sent, tournaments: tournaments.length }
}
