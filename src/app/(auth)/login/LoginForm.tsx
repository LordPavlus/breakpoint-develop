"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestOtp, type RequestOtpState } from "@/server/actions/auth"

const initialState: RequestOtpState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(requestOtp, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          name="role"
          value="coach"
          className="accent-primary"
        />
        <span className="text-sm text-muted-foreground">
          Регистрируюсь как тренер
        </span>
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Отправляем код…" : "Получить код"}
      </Button>
    </form>
  )
}
