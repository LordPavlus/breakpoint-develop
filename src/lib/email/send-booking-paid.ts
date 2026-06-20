import { resend } from "@/lib/email/resend"
import { bookingPaidEmailHtml } from "@/lib/email/templates/booking-paid-email"

export async function sendBookingPaidEmail(
  email: string,
  params: { coachName: string; startsAt: Date; location: string }
) {
  if (!resend) {
    console.log(`[email-payment] RESEND_API_KEY не задан — подтверждение оплаты тренировки для ${email}`)
    return
  }

  await resend.emails.send({
    from: "Break Point <noreply@breakpoint.moscow>",
    to: email,
    subject: "Оплата прошла успешно — тренировка подтверждена",
    html: bookingPaidEmailHtml(params),
  })
}
