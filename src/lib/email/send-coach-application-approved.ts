import { resend } from "@/lib/email/resend"
import { coachApplicationApprovedEmailHtml } from "@/lib/email/templates/coach-application-approved-email"

export async function sendCoachApplicationApprovedEmail(email: string) {
  if (!resend) {
    console.log(`[email-coach-application] RESEND_API_KEY не задан — заявка ${email} одобрена`)
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  await resend.emails.send({
    from: "Break Point <noreply@bptennis.ru>",
    to: email,
    subject: "Заявка на статус тренера одобрена",
    html: coachApplicationApprovedEmailHtml({ coachUrl: `${baseUrl}/coach` }),
  })
}
