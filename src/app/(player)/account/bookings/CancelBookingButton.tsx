"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { cancelBooking, type CancelBookingState } from "@/server/actions/bookings"

const initialState: CancelBookingState = {}

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(cancelBooking, initialState)

  return (
    <form action={formAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      {state?.error && (
        <p className="mb-2 text-sm text-destructive">{state.error}</p>
      )}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {pending ? "Отменяем…" : "Отменить запись"}
      </Button>
    </form>
  )
}
