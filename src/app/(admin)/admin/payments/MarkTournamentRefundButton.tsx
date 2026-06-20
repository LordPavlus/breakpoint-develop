"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  markTournamentRefundProcessed,
  type MarkTournamentRefundProcessedState,
} from "@/server/actions/tournaments"

const initialState: MarkTournamentRefundProcessedState = {}

export function MarkTournamentRefundButton({ registrationId }: { registrationId: string }) {
  const [state, formAction, pending] = useActionState(
    markTournamentRefundProcessed,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="registrationId" value={registrationId} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Обрабатываем…" : "Отметить возврат выполненным"}
      </Button>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state?.success && <p className="text-xs text-primary">{state.success}</p>}
    </form>
  )
}
