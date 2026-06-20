import { resend } from "@/lib/email/resend"
import { otpEmailHtml } from "@/lib/email/templates/otp-email"

export async function sendOtpEmail(email: string, code: string) {
  if (!resend) {
    console.log(`[email-otp] RESEND_API_KEY не задан — код для ${email}: ${code}`)
    return
  }

  await resend.emails.send({
    from: "Break Point <noreply@breakpoint.moscow>",
    to: email,
    subject: `Код для входа: ${code}`,
    html: otpEmailHtml(code),
  })
}
