"use client"

import { useActionState, useRef } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  togglePromoCodeActive,
  type TogglePromoCodeState,
} from "@/server/actions/promo-codes"

const initialState: TogglePromoCodeState = {}

export function PromoCodeActiveSelect({
  id,
  active,
}: {
  id: string
  active: boolean
}) {
  const [state, formAction] = useActionState(togglePromoCodeActive, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form action={formAction} ref={formRef} className="space-y-1">
      <input type="hidden" name="id" value={id} />
      <Select
        name="active"
        defaultValue={active ? "true" : "false"}
        onValueChange={() => formRef.current?.requestSubmit()}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Активен</SelectItem>
          <SelectItem value="false">Отключён</SelectItem>
        </SelectContent>
      </Select>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  )
}
