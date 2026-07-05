"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  updateAdminSettings,
  type UpdateSettingsState,
} from "@/server/actions/settings"

const initialState: UpdateSettingsState = {}

export function SettingsForm({
  minTrainingPrice,
  maxTrainingPrice,
  platformCommissionPct,
}: {
  minTrainingPrice: number
  maxTrainingPrice: number
  platformCommissionPct: number
}) {
  const [state, formAction, pending] = useActionState(
    updateAdminSettings,
    initialState
  )

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="minTrainingPrice">Минимальная цена тренировки, ₽</Label>
        <Input
          id="minTrainingPrice"
          name="minTrainingPrice"
          type="number"
          min={0}
          step="1"
          defaultValue={minTrainingPrice}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="maxTrainingPrice">Максимальная цена тренировки, ₽</Label>
        <Input
          id="maxTrainingPrice"
          name="maxTrainingPrice"
          type="number"
          min={0}
          step="1"
          defaultValue={maxTrainingPrice}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="platformCommissionPct">Комиссия платформы, %</Label>
        <Input
          id="platformCommissionPct"
          name="platformCommissionPct"
          type="number"
          min={0}
          max={100}
          step="0.1"
          defaultValue={platformCommissionPct}
          required
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-primary">Настройки сохранены.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить"}
      </Button>
    </form>
  )
}
