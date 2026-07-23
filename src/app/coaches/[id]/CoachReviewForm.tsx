"use client"

import { useActionState, useState } from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitCoachReview, type SubmitCoachReviewState } from "@/server/actions/reviews"

const initialState: SubmitCoachReviewState = {}

export function CoachReviewForm({ coachId }: { coachId: string }) {
  const [state, formAction, pending] = useActionState(submitCoachReview, initialState)
  const [rating, setRating] = useState(5)

  if (state?.success) {
    return (
      <p className="rounded-lg border border-border p-3 text-sm text-primary">
        Спасибо! Отзыв отправлен и появится после проверки модератором.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-2 rounded-lg border border-border p-3">
      <input type="hidden" name="coachId" value={coachId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-sm font-medium text-foreground">Оставить отзыв</p>
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
                value <= rating ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      <Textarea name="comment" placeholder="Комментарий (необязательно)" rows={2} />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Отправляем…" : "Отправить отзыв"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Отзыв опубликуется после проверки модератором
      </p>
    </form>
  )
}
