import { resend } from "@/lib/email/resend"
import { coachApplicationRejectedEmailHtml } from "@/lib/email/templates/coach-application-rejected-email"

export async function sendCoachApplicationRejectedEmail(email: string, adminNote: string | null) {
  if (!resend) {
    console.log(`[email-coach-application] RESEND_API_KEY не задан — заявка ${email} отклонена`)
    return
  }

  await resend.emails.send({
    from: "Break Point <noreply@bptennis.ru>",
    to: email,
    subject: "Заявка на статус тренера отклонена",
    html: coachApplicationRejectedEmailHtml({ adminNote }),
  })
}
