import { resend } from "@/lib/email/resend"
import { coachApplicationRejectedEmailHtml } from "@/lib/email/templates/coach-application-rejected-email"

export async function sendCoachApplicationRejectedEmail(email: string, adminNote: string | null) {
  if (!resend) {
    console.log(`[email-coach-application] RESEND_API_KEY не задан — заявка ${email} отклонена`)
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  await resend.emails.send({
    from: "Break Point <noreply@bptennis.ru>",
    to: email,
    subject: "Заявка на статус тренера отклонена",
    html: coachApplicationRejectedEmailHtml({ adminNote, reapplyUrl: `${baseUrl}/become-coach` }),
  })
}
