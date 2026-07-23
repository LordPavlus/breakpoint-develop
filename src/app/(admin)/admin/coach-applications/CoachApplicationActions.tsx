"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  approveCoachApplication,
  rejectCoachApplication,
  type ReviewCoachApplicationState,
} from "@/server/actions/coach-application"

const initialState: ReviewCoachApplicationState = {}

export function CoachApplicationActions({ applicationId }: { applicationId: string }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveCoachApplication,
    initialState
  )
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectCoachApplication,
    initialState
  )

  const pending = approvePending || rejectPending

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={approveAction}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <Button type="submit" size="sm" disabled={pending}>
            {approvePending ? "Одобряем…" : "Одобрить"}
          </Button>
        </form>
        <form action={rejectAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="applicationId" value={applicationId} />
          <Input
            name="adminNote"
            placeholder="Причина отказа (необязательно)"
            className="h-8 w-56 text-xs"
          />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            {rejectPending ? "Отклоняем…" : "Отклонить"}
          </Button>
        </form>
      </div>
      {approveState?.error && <p className="text-xs text-destructive">{approveState.error}</p>}
      {rejectState?.error && <p className="text-xs text-destructive">{rejectState.error}</p>}
    </div>
  )
}
