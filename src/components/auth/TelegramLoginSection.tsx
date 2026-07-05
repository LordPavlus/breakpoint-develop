"use client"

import { useState, useTransition } from "react"

import { TelegramLoginButton } from "@/components/auth/TelegramLoginButton"
import { signInWithTelegram } from "@/server/actions/auth"
import type { TelegramWidgetUser } from "@/lib/telegram"

export function TelegramLoginSection({ botUsername }: { botUsername?: string }) {
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  if (!botUsername) return null

  const handleAuth = (data: TelegramWidgetUser) => {
    setError(null)
    startTransition(async () => {
      const result = await signInWithTelegram(data)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-2">
      <TelegramLoginButton botUsername={botUsername} onAuth={handleAuth} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
