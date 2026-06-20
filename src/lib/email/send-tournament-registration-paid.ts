import { resend } from "@/lib/email/resend"
import { tournamentRegistrationPaidEmailHtml } from "@/lib/email/templates/tournament-registration-paid-email"

export async function sendTournamentRegistrationPaidEmail(
  email: string,
  params: { title: string; startsAt: Date; location: string | null; tournamentUrl: string }
) {
  if (!resend) {
    console.log(`[email-payment] RESEND_API_KEY не задан — подтверждение оплаты турнира для ${email}`)
    return
  }

  await resend.emails.send({
    from: "Break Point <noreply@breakpoint.moscow>",
    to: email,
    subject: `Оплата прошла успешно — регистрация на «${params.title}» подтверждена`,
    html: tournamentRegistrationPaidEmailHtml(params),
  })
}
