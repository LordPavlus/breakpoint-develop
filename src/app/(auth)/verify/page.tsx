import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OTP_RESEND_INTERVAL_MS } from "@/lib/otp"
import { VerifyForm } from "./VerifyForm"
import { ResendCodeButton } from "./ResendCodeButton"

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackUrl?: string }>
}) {
  const { email, callbackUrl } = await searchParams

  if (!email) {
    redirect("/login")
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16 sm:py-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Введите код</CardTitle>
          <CardDescription>
            Мы отправили 6-значный код на {email}. Он действителен 10 минут.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <VerifyForm email={email} callbackUrl={callbackUrl} />
          <ResendCodeButton
            email={email}
            callbackUrl={callbackUrl}
            resendSeconds={OTP_RESEND_INTERVAL_MS / 1000}
          />
          <a
            href="https://t.me/G_Pavel_G"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-primary underline-offset-4 hover:underline"
          >
            Код не приходит?
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
