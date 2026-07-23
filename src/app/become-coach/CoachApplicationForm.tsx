"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  submitCoachApplication,
  type SubmitCoachApplicationState,
} from "@/server/actions/coach-application"

const initialState: SubmitCoachApplicationState = {}

export function CoachApplicationForm({
  bio,
  specialization,
}: {
  bio: string
  specialization: string
}) {
  const [state, formAction, pending] = useActionState(submitCoachApplication, initialState)

  if (state?.success) {
    return (
      <p className="text-sm text-primary">
        Заявка отправлена на рассмотрение. Мы пришлём результат на вашу почту.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="bio">О себе и опыте</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          rows={4}
          placeholder="Опыт тренерской работы, достижения, методика"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="specialization">Специализация</Label>
        <Input
          id="specialization"
          name="specialization"
          defaultValue={specialization}
          placeholder="Техника удара, Юниоры, Подготовка к турнирам"
        />
        <p className="text-xs text-muted-foreground">Через запятую</p>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Отправляем…" : "Отправить заявку"}
      </Button>
    </form>
  )
}
