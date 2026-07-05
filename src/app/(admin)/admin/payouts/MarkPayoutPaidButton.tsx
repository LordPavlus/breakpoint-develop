"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { markPayoutPaid, type MarkPayoutPaidState } from "@/server/actions/payouts"

const initialState: MarkPayoutPaidState = {}

export function MarkPayoutPaidButton({ payoutId }: { payoutId: string }) {
  const [state, formAction, pending] = useActionState(markPayoutPaid, initialState)

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="payoutId" value={payoutId} />
      <Input
        name="adminNote"
        placeholder="Референс перевода (необязательно)"
        className="h-8 w-56 text-xs"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Сохраняем…" : "Отметить выплаченным"}
      </Button>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  )
}
