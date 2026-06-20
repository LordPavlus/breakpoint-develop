"use client"

import { useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TelegramLoginButton } from "@/components/auth/TelegramLoginButton"
import { linkTelegramAccount, unlinkTelegramAccount } from "@/server/actions/profile"
import type { TelegramWidgetUser } from "@/lib/telegram"

export function TelegramSection({
  botUsername,
  hasTelegram,
  telegramUsername,
}: {
  botUsername?: string
  hasTelegram: boolean
  telegramUsername: string | null
}) {
  const [linked, setLinked] = useState(hasTelegram)
  const [username, setUsername] = useState(telegramUsername)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleAuth = (data: TelegramWidgetUser) => {
    setError(null)
    startTransition(async () => {
      const result = await linkTelegramAccount(data)
      if (result.error) {
        setError(result.error)
        return
      }
      setLinked(true)
      setUsername(data.username ?? null)
    })
  }

  const handleUnlink = () => {
    setError(null)
    startTransition(async () => {
      const result = await unlinkTelegramAccount()
      if (result.error) {
        setError(result.error)
        return
      }
      setLinked(false)
      setUsername(null)
    })
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Telegram</CardTitle>
        <CardDescription>
          Привяжите Telegram, чтобы получать уведомления о бронированиях и турнирах.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {linked ? (
          <div className="flex items-center justify-between gap-4">
            <Badge variant="secondary">
              {username ? `Подключено: @${username}` : "Telegram подключён"}
            </Badge>
            <Button variant="outline" size="sm" disabled={pending} onClick={handleUnlink}>
              Отключить
            </Button>
          </div>
        ) : botUsername ? (
          <TelegramLoginButton botUsername={botUsername} onAuth={handleAuth} />
        ) : (
          <p className="text-sm text-muted-foreground">Привязка Telegram временно недоступна.</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
