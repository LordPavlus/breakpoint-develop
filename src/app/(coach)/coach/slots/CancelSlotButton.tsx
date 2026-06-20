"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { cancelSlot, type CancelSlotState } from "@/server/actions/slots"

const initialState: CancelSlotState = {}

export function CancelSlotButton({ slotId }: { slotId: string }) {
  const [state, formAction, pending] = useActionState(cancelSlot, initialState)

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="slotId" value={slotId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Отмена…" : "Отменить"}
      </Button>
      {state?.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </form>
  )
}
