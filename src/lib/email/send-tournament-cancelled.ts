import { resend } from "@/lib/email/resend"
import { tournamentCancelledEmailHtml } from "@/lib/email/templates/tournament-cancelled-email"

export async function sendTournamentCancelledEmail(
  email: string,
  params: { title: string; refunded: boolean }
) {
  if (!resend) {
    console.log(`[email-tournament] RESEND_API_KEY не задан — отмена турнира «${params.title}» для ${email}`)
    return
  }

  await resend.emails.send({
    from: "Break Point <noreply@breakpoint.moscow>",
    to: email,
    subject: `Турнир «${params.title}» отменён`,
    html: tournamentCancelledEmailHtml(params),
  })
}
