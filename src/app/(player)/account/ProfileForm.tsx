"use client"

import { useActionState, useState } from "react"
import type { NtrpLevel } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateProfile, type UpdateProfileState } from "@/server/actions/profile"
import { ntrpLabels } from "@/lib/ntrp"

const initialState: UpdateProfileState = {}

const DAYS = [
  { value: "Понедельник", label: "Понедельник" },
  { value: "Вторник", label: "Вторник" },
  { value: "Среда", label: "Среда" },
  { value: "Четверг", label: "Четверг" },
  { value: "Пятница", label: "Пятница" },
  { value: "Суббота", label: "Суббота" },
  { value: "Воскресенье", label: "Воскресенье" },
]

const DISTRICTS = [
  "ЦАО", "САО", "СВАО", "ВАО", "ЮВАО",
  "ЮАО", "ЮЗАО", "ЗАО", "СЗАО", "ЗелАО", "ТАО", "НАО",
]

export function ProfileForm({
  email,
  name,
  phone,
  bio,
  ntrpLevel,
  weekdayAvailability,
  weekendAvailability,
  preferredDays,
  preferredDistricts,
}: {
  email: string
  name: string
  phone: string
  bio: string
  ntrpLevel: NtrpLevel | null
  weekdayAvailability: string
  weekendAvailability: string
  preferredDays: string[]
  preferredDistricts: string[]
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState)

  const savedCustom = preferredDistricts.find((d) => !DISTRICTS.includes(d)) ?? ""
  const [showCustomDistrict, setShowCustomDistrict] = useState(Boolean(savedCustom))

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {/* Базовые данные */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Телефон</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          placeholder="+7 (999) 123-45-67"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ntrpLevel">Уровень NTRP</Label>
        <Select name="ntrpLevel" defaultValue={ntrpLevel ?? undefined}>
          <SelectTrigger id="ntrpLevel" className="w-full">
            <SelectValue placeholder="Не указан" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ntrpLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          rows={3}
          placeholder="Немного о вашем теннисном опыте"
        />
      </div>

      {/* Доступность для турниров */}
      <div className="space-y-4 rounded-xl border border-border p-4">
        <p className="text-sm font-medium text-foreground">Для участия в турнирах</p>

        <div className="space-y-1.5">
          <Label htmlFor="weekdayAvailability">Доступность в будни</Label>
          <Input
            id="weekdayAvailability"
            name="weekdayAvailability"
            defaultValue={weekdayAvailability}
            placeholder="Пример: с 9:00 до 13:00"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="weekendAvailability">Доступность в выходные</Label>
          <Input
            id="weekendAvailability"
            name="weekendAvailability"
            defaultValue={weekendAvailability}
            placeholder="Пример: с 9:00 до 13:00"
          />
        </div>

        {/* Дни недели */}
        <div className="space-y-2">
          <Label>Удобные дни для игры</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <label
                key={day.value}
                className="flex cursor-pointer items-center gap-1.5"
              >
                <input
                  type="checkbox"
                  name="preferredDays"
                  value={day.value}
                  defaultChecked={preferredDays.includes(day.value)}
                  className="accent-primary"
                />
                <span className="text-sm">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Районы Москвы */}
        <div className="space-y-2">
          <Label>Удобные районы Москвы</Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {DISTRICTS.map((district) => (
              <label
                key={district}
                className="flex cursor-pointer items-center gap-1.5"
              >
                <input
                  type="checkbox"
                  name="preferredDistricts"
                  value={district}
                  defaultChecked={preferredDistricts.includes(district)}
                  className="accent-primary"
                />
                <span className="text-sm">{district}</span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                className="accent-primary"
                checked={showCustomDistrict}
                onChange={(e) => setShowCustomDistrict(e.target.checked)}
              />
              <span className="text-sm">Свой вариант</span>
            </label>
          </div>

          {showCustomDistrict && (
            <Input
              name="customDistrict"
              defaultValue={savedCustom}
              placeholder="Укажите район"
              className="mt-2 max-w-xs"
            />
          )}
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">Профиль сохранён.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить"}
      </Button>
    </form>
  )
}
