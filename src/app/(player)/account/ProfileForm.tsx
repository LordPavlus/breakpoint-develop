"use client"

import { useState, useTransition } from "react"
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

const DAYS = [
  "Понедельник", "Вторник", "Среда", "Четверг",
  "Пятница", "Суббота", "Воскресенье",
]

const DISTRICTS = [
  "ЦАО", "САО", "СВАО", "ВАО", "ЮВАО",
  "ЮАО", "ЮЗАО", "ЗАО", "СЗАО", "ЗелАО", "ТАО", "НАО",
]

export function ProfileForm({
  email,
  name: initialName,
  phone: initialPhone,
  bio: initialBio,
  ntrpLevel: initialNtrp,
  weekdayAvailability: initialWeekday,
  weekendAvailability: initialWeekend,
  preferredDays: initialDays,
  preferredDistricts: initialDistricts,
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
  const savedCustom = initialDistricts.find((d) => !DISTRICTS.includes(d)) ?? ""

  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [bio, setBio] = useState(initialBio)
  const [ntrpLevel, setNtrpLevel] = useState<string>(initialNtrp ?? "")
  const [weekday, setWeekday] = useState(initialWeekday)
  const [weekend, setWeekend] = useState(initialWeekend)
  const [days, setDays] = useState<string[]>(initialDays)
  const [districts, setDistricts] = useState<string[]>(
    initialDistricts.filter((d) => DISTRICTS.includes(d))
  )
  const [showCustom, setShowCustom] = useState(Boolean(savedCustom))
  const [customDistrict, setCustomDistrict] = useState(savedCustom)
  const [result, setResult] = useState<UpdateProfileState>({})
  const [isPending, startTransition] = useTransition()

  function toggleDay(day: string) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function toggleDistrict(d: string) {
    setDistricts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData()
    fd.set("name", name)
    fd.set("phone", phone)
    fd.set("bio", bio)
    fd.set("ntrpLevel", ntrpLevel)
    fd.set("weekdayAvailability", weekday)
    fd.set("weekendAvailability", weekend)
    days.forEach((d) => fd.append("preferredDays", d))
    districts.forEach((d) => fd.append("preferredDistricts", d))
    if (showCustom && customDistrict.trim()) {
      fd.set("customDistrict", customDistrict.trim())
    }

    startTransition(async () => {
      const res = await updateProfile({}, fd)
      setResult(res)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Телефон</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 (999) 123-45-67"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ntrpLevel">Уровень NTRP</Label>
        <Select value={ntrpLevel} onValueChange={(v) => setNtrpLevel(v ?? "")}>
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
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Немного о вашем теннисном опыте"
        />
      </div>

      <div className="space-y-4 rounded-xl border border-border p-4">
        <p className="text-sm font-medium text-foreground">Для участия в турнирах</p>

        <div className="space-y-1.5">
          <Label htmlFor="weekday">Доступность в будни</Label>
          <Input
            id="weekday"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            placeholder="Пример: с 9:00 до 13:00"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="weekend">Доступность в выходные</Label>
          <Input
            id="weekend"
            value={weekend}
            onChange={(e) => setWeekend(e.target.value)}
            placeholder="Пример: с 9:00 до 13:00"
          />
        </div>

        <div className="space-y-2">
          <Label>Удобные дни для игры</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <label key={day} className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="accent-primary"
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Удобные районы Москвы</Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {DISTRICTS.map((district) => (
              <label key={district} className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={districts.includes(district)}
                  onChange={() => toggleDistrict(district)}
                  className="accent-primary"
                />
                <span className="text-sm">{district}</span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={showCustom}
                onChange={(e) => setShowCustom(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-sm">Свой вариант</span>
            </label>
          </div>
          {showCustom && (
            <Input
              value={customDistrict}
              onChange={(e) => setCustomDistrict(e.target.value)}
              placeholder="Укажите район"
              className="mt-2 max-w-xs"
            />
          )}
        </div>
      </div>

      {result?.error && <p className="text-sm text-destructive">{result.error}</p>}
      {result?.success && <p className="text-sm text-primary">Профиль сохранён.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Сохраняем…" : "Сохранить"}
      </Button>
    </form>
  )
}
