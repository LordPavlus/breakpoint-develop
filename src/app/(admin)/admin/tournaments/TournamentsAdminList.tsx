"use client"

import { useState, useActionState } from "react"
import Link from "next/link"
import type { TournamentStatus, TournamentFormat, NtrpLevel } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  statusLabels,
  statusVariants,
  formatLabels,
  formatDateRange,
} from "@/app/tournaments/components/TournamentCard"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"
import { TournamentStatusSelect } from "./TournamentStatusSelect"
import {
  bulkUpdateTournamentStatus,
  type BulkUpdateStatusState,
} from "@/server/actions/tournaments"

type TournamentItem = {
  id: string
  title: string
  status: TournamentStatus
  format: TournamentFormat
  entryFee: number
  location: string | null
  startsAt: Date
  endsAt: Date | null
  maxParticipants: number | null
  minNtrpLevel: NtrpLevel | null
  maxNtrpLevel: NtrpLevel | null
  _count: { registrations: number }
}

const initialBulkState: BulkUpdateStatusState = {}

export function TournamentsAdminList({ tournaments }: { tournaments: TournamentItem[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkState, bulkAction, bulkPending] = useActionState(
    bulkUpdateTournamentStatus,
    initialBulkState
  )

  function toggleAll() {
    if (selected.size === tournaments.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(tournaments.map((t) => t.id)))
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Групповое редактирование */}
      {selected.size > 0 && (
        <form action={bulkAction} className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium text-foreground">
            Выбрано: {selected.size}
          </span>
          {Array.from(selected).map((id) => (
            <input key={id} type="hidden" name="ids" value={id} />
          ))}
          <Select name="status">
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Новый статус…" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" disabled={bulkPending}>
            {bulkPending ? "Применяем…" : "Применить"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setSelected(new Set())}>
            Сбросить
          </Button>
          {bulkState?.error && (
            <p className="text-sm text-destructive">{bulkState.error}</p>
          )}
        </form>
      )}

      {/* Выбрать все */}
      <div className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="accent-primary"
            checked={selected.size === tournaments.length && tournaments.length > 0}
            onChange={toggleAll}
          />
          Выбрать все
        </label>
      </div>

      {/* Карточки турниров */}
      <div className="space-y-3">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl border p-4 transition-colors ${
              selected.has(t.id) ? "border-primary/50 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex flex-wrap items-start gap-3">
              {/* Чекбокс */}
              <input
                type="checkbox"
                className="mt-1 accent-primary"
                checked={selected.has(t.id)}
                onChange={() => toggle(t.id)}
              />

              {/* Основная инфа */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {t.title}
                  </Link>
                  <Badge variant={statusVariants[t.status]} className="text-xs">
                    {statusLabels[t.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateRange(t.startsAt, t.endsAt)} · {formatLabels[t.format]} ·{" "}
                  {priceFormatter.format(t.entryFee)} ·{" "}
                  участников: {t._count.registrations}
                  {t.maxParticipants ? ` / ${t.maxParticipants}` : ""}
                  {t.location ? ` · ${t.location}` : ""}
                </p>
              </div>

              {/* Действия */}
              <div className="flex flex-wrap items-center gap-2">
                <TournamentStatusSelect tournamentId={t.id} status={t.status} />
                <Link
                  href={`/admin/tournaments/${t.id}/edit`}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  Редактировать
                </Link>
                <Link
                  href={`/admin/tournaments/${t.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Управление
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
