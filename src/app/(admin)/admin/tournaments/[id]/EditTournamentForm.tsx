"use client"

import { useActionState } from "react"
import type { NtrpLevel, TournamentFormat, Tournament } from "@prisma/client"

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
import { updateTournament, type UpdateTournamentState } from "@/server/actions/tournaments"
import { formatLabels } from "@/app/tournaments/components/TournamentCard"
import { ntrpLabels } from "@/lib/ntrp"

const initialState: UpdateTournamentState = {}

function toDatetimeLocal(date: Date | null): string {
  if (!date) return ""
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function EditTournamentForm({ tournament }: { tournament: Tournament }) {
  const [state, formAction, pending] = useActionState(updateTournament, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tournamentId" value={tournament.id} />

      <div className="space-y-1.5">
        <Label htmlFor="title">Название</Label>
        <Input id="title" name="title" defaultValue={tournament.title} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={tournament.description} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prizePoolDescription">Призовой фонд</Label>
        <Textarea id="prizePoolDescription" name="prizePoolDescription" rows={2}
          defaultValue={tournament.prizePoolDescription ?? ""} placeholder="Описание призов" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="format">Формат</Label>
          <Select name="format" defaultValue={tournament.format}>
            <SelectTrigger id="format" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(formatLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="entryFee">Взнос, ₽</Label>
          <Input id="entryFee" name="entryFee" type="number" min={0} step="1"
            defaultValue={tournament.entryFee.toNumber()} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Место проведения</Label>
        <Input id="location" name="location" defaultValue={tournament.location ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startsAt">Начало</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local"
            defaultValue={toDatetimeLocal(tournament.startsAt)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endsAt">Окончание</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local"
            defaultValue={toDatetimeLocal(tournament.endsAt)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="registrationDeadline">Дедлайн регистрации</Label>
        <Input id="registrationDeadline" name="registrationDeadline" type="datetime-local"
          defaultValue={toDatetimeLocal(tournament.registrationDeadline)} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="minParticipants">Минимум участников</Label>
          <Input id="minParticipants" name="minParticipants" type="number" min={2} step="1"
            defaultValue={tournament.minParticipants ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxParticipants">Максимум участников</Label>
          <Input id="maxParticipants" name="maxParticipants" type="number" min={0} step="1"
            defaultValue={tournament.maxParticipants ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="minNtrpLevel">NTRP от</Label>
          <Select name="minNtrpLevel" defaultValue={tournament.minNtrpLevel ?? "NONE"}>
            <SelectTrigger id="minNtrpLevel" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Без ограничения</SelectItem>
              {Object.entries(ntrpLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxNtrpLevel">NTRP до</Label>
          <Select name="maxNtrpLevel" defaultValue={tournament.maxNtrpLevel ?? "NONE"}>
            <SelectTrigger id="maxNtrpLevel" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Без ограничения</SelectItem>
              {Object.entries(ntrpLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : "Сохранить изменения"}
        </Button>
      </div>
    </form>
  )
}
