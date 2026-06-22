"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveTelegramUsername, type UpdateProfileState } from "@/server/actions/profile"

const initialState: UpdateProfileState = {}

export function TelegramSection({ telegramUsername }: { telegramUsername: string | null }) {
  const [state, formAction, pending] = useActionState(saveTelegramUsername, initialState)

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Telegram</CardTitle>
        <CardDescription>
          Укажите ваш Telegram для связи с другими игроками при согласовании матчей.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="telegramUsername">Имя пользователя</Label>
            <Input
              id="telegramUsername"
              name="telegramUsername"
              placeholder="@username"
              defaultValue={telegramUsername ? `@${telegramUsername}` : ""}
            />
          </div>
          <Button type="submit" disabled={pending} variant="outline">
            {pending ? "Сохраняем…" : "Сохранить"}
          </Button>
        </form>
        {state?.success && (
          <p className="mt-2 text-sm text-muted-foreground">Сохранено</p>
        )}
        {state?.error && (
          <p className="mt-2 text-sm text-destructive">{state.error}</p>
        )}
      </CardContent>
    </Card>
  )
}
