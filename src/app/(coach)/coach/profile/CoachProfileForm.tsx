"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateCoachProfile, type UpdateCoachProfileState } from "@/server/actions/coach-profile"

const initialState: UpdateCoachProfileState = {}

export function CoachProfileForm({
  email,
  name,
  bio,
  specialization,
  payoutInfo,
}: {
  email: string
  name: string
  bio: string
  specialization: string
  payoutInfo: string
}) {
  const [state, formAction, pending] = useActionState(updateCoachProfile, initialState)

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          rows={4}
          placeholder="Опыт, методика, достижения"
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
        <p className="text-xs text-muted-foreground">
          Через запятую — теги покажутся в профиле и на карточках слотов
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payoutInfo">Реквизиты для выплат</Label>
        <Textarea
          id="payoutInfo"
          name="payoutInfo"
          defaultValue={payoutInfo}
          rows={2}
          placeholder="Номер карты или телефон СБП для перевода"
        />
        <p className="text-xs text-muted-foreground">
          Видно только администратору — используется для ручных выплат
        </p>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">Профиль сохранён.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить"}
      </Button>
    </form>
  )
}
