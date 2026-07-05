"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { computePayouts, type ComputePayoutsState } from "@/server/actions/payouts"

const initialState: ComputePayoutsState = {}

export function ComputePayoutsButton() {
  const [state, formAction, pending] = useActionState(computePayouts, initialState)

  return (
    <form action={formAction} className="flex items-center gap-3">
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Считаем…" : "Рассчитать выплаты"}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-muted-foreground">{state.success}</p>
      )}
    </form>
  )
}
