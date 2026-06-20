"use client"

import { useActionState } from "react"

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
import {
  createTournament,
  type CreateTournamentState,
} from "@/server/actions/tournaments"
import { formatLabels } from "@/app/tournaments/components/TournamentCard"
import { ntrpLabels } from "@/lib/ntrp"

const initialState: CreateTournamentState = {}

export function TournamentForm() {
  const [state, formAction, pending] = useActionState(createTournament, initialState)

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Название</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" rows={4} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="format">Формат</Label>
          <Select name="format" defaultValue="GROUP_PLAYOFF">
            <SelectTrigger id="format" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(formatLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="entryFee">Взнос за участие, ₽</Label>
          <Input id="entryFee" name="entryFee" type="number" min={0} step="1" required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Место проведения</Label>
        <Input id="location" name="location" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startsAt">Начало</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endsAt">Окончание</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="registrationDeadline">Дедлайн регистрации</Label>
        <Input
          id="registrationDeadline"
          name="registrationDeadline"
          type="datetime-local"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="minParticipants">Минимум участников</Label>
          <Input id="minParticipants" name="minParticipants" type="number" min={2} step="1" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxParticipants">Максимум участников</Label>
          <Input id="maxParticipants" name="maxParticipants" type="number" min={0} step="1" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="minNtrpLevel">NTRP от</Label>
          <Select name="minNtrpLevel" defaultValue="NONE">
            <SelectTrigger id="minNtrpLevel" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Без ограничения</SelectItem>
              {Object.entries(ntrpLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxNtrpLevel">NTRP до</Label>
          <Select name="maxNtrpLevel" defaultValue="NONE">
            <SelectTrigger id="maxNtrpLevel" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Без ограничения</SelectItem>
              {Object.entries(ntrpLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Создаём…" : "Создать турнир"}
      </Button>
    </form>
  )
}
