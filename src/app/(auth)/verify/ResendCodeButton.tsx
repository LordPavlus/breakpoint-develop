"use client"

import { useActionState, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { requestOtp, type RequestOtpState } from "@/server/actions/auth"

const initialState: RequestOtpState = {}

export function ResendCodeButton({
  email,
  callbackUrl,
  resendSeconds,
}: {
  email: string
  callbackUrl?: string
  resendSeconds: number
}) {
  const [state, formAction, pending] = useActionState(requestOtp, initialState)
  const [secondsLeft, setSecondsLeft] = useState(resendSeconds)

  useEffect(() => {
    if (resendSeconds <= 0) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendSeconds])

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="email" value={email} />
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={pending || secondsLeft > 0}
      >
        {pending
          ? "Отправляем…"
          : secondsLeft > 0
            ? `Отправить код повторно (${secondsLeft})`
            : "Отправить код повторно"}
      </Button>
    </form>
  )
}
