"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSlot, type CreateSlotState } from "@/server/actions/slots"

const initialState: CreateSlotState = {}

const durationOptions = [
  { value: "60", label: "1 час" },
  { value: "90", label: "1,5 часа" },
  { value: "120", label: "2 часа" },
]

export function NewSlotForm({
  minPrice,
  maxPrice,
}: {
  minPrice: number
  maxPrice: number
}) {
  const [state, formAction, pending] = useActionState(createSlot, initialState)

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="date">Дата</Label>
        <Input id="date" name="date" type="date" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="startTime">Время начала</Label>
        <Input id="startTime" name="startTime" type="time" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="durationMinutes">Длительность</Label>
        <Select name="durationMinutes" defaultValue="60">
          <SelectTrigger id="durationMinutes" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {durationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="location">Место</Label>
        <Input
          id="location"
          name="location"
          placeholder="Корт «Лужники», корт №3"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="price">Цена, ₽</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min={minPrice}
          max={maxPrice}
          step="1"
          required
        />
        <p className="text-xs text-muted-foreground">
          От {minPrice} до {maxPrice} ₽
        </p>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Создаём…" : "Создать слот"}
      </Button>
    </form>
  )
}
