import { resend } from "@/lib/email/resend"
import { bookingReminderEmailHtml } from "@/lib/email/templates/booking-reminder-email"

export async function sendBookingReminderEmail(
  email: string,
  params: { coachName: string; startsAt: Date; location: string }
) {
  if (!resend) {
    console.log(`[email-reminder] RESEND_API_KEY не задан — напоминание о тренировке для ${email}`)
    return
  }

  await resend.emails.send({
    from: "Break Point <noreply@breakpoint.moscow>",
    to: email,
    subject: "Напоминание: завтра тренировка",
    html: bookingReminderEmailHtml(params),
  })
}
