"use client"

import { useActionState, useState } from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { confirmBooking, type ConfirmBookingState } from "@/server/actions/bookings"

const initialState: ConfirmBookingState = {}

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(confirmBooking, initialState)
  const [rating, setRating] = useState(5)

  return (
    <form
      action={formAction}
      className="mt-3 space-y-2 rounded-lg border border-border p-3"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-sm font-medium text-foreground">
        Подтвердите тренировку и оцените тренера
      </p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="rounded p-1.5"
            aria-label={`Оценка ${value} из 5`}
          >
            <Star
              className={cn(
                "size-5",
                value <= rating
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        name="comment"
        placeholder="Комментарий (необязательно)"
        rows={2}
      />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Отправляем…" : "Подтвердить и оценить"}
      </Button>
    </form>
  )
}
