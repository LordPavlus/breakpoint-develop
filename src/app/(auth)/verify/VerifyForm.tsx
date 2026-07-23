"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyOtp, type VerifyOtpState } from "@/server/actions/auth"

const initialState: VerifyOtpState = {}

export function VerifyForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(verifyOtp, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="email" value={email} />
      <div className="space-y-1.5">
        <Label htmlFor="code">Код из письма</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          required
        />
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Проверяем…" : "Войти"}
      </Button>
    </form>
  )
}
