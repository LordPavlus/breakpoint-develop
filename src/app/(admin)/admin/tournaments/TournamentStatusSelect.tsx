"use client"

import { useActionState, useRef } from "react"
import type { TournamentStatus } from "@prisma/client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  updateTournamentStatus,
  type UpdateTournamentStatusState,
} from "@/server/actions/tournaments"
import { statusLabels } from "@/app/tournaments/components/TournamentCard"

const initialState: UpdateTournamentStatusState = {}

export function TournamentStatusSelect({
  tournamentId,
  status,
}: {
  tournamentId: string
  status: TournamentStatus
}) {
  const [state, formAction] = useActionState(updateTournamentStatus, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form action={formAction} ref={formRef} className="space-y-1">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <Select
        name="status"
        defaultValue={status}
        onValueChange={() => formRef.current?.requestSubmit()}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  )
}
