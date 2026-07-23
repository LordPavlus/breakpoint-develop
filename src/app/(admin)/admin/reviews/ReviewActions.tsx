"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  approveReview,
  rejectReview,
  type ReviewModerationState,
} from "@/server/actions/reviews"

const initialState: ReviewModerationState = {}

export function ReviewActions({ reviewId }: { reviewId: string }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveReview,
    initialState
  )
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectReview, initialState)

  const pending = approvePending || rejectPending

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <form action={approveAction}>
          <input type="hidden" name="reviewId" value={reviewId} />
          <Button type="submit" size="sm" disabled={pending}>
            {approvePending ? "Одобряем…" : "Одобрить"}
          </Button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="reviewId" value={reviewId} />
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
