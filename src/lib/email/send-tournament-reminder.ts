import { resend } from "@/lib/email/resend"
import { tournamentReminderEmailHtml } from "@/lib/email/templates/tournament-reminder-email"

export async function sendTournamentReminderEmail(
  email: string,
  params: { title: string; startsAt: Date; location: string | null; tournamentUrl: string }
) {
  if (!resend) {
    console.log(`[email-reminder] RESEND_API_KEY не задан — напоминание о турнире для ${email}`)
    return
  }

  await resend.emails.send({
    from: "Break Point <noreply@bptennis.ru>",
    to: email,
    subject: `Напоминание: завтра старт турнира «${params.title}»`,
    html: tournamentReminderEmailHtml(params),
  })
}
