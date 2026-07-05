"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBooking, type CreateBookingState } from "@/server/actions/bookings"
import {
  capitalize,
  dateFormatter,
  priceFormatter,
  timeFormatter,
} from "./TrainingSlotCard"

export type BookingSlotInfo = {
  id: string
  startsAt: Date
  endsAt: Date
  location: string
  price: number
}

const initialState: CreateBookingState = {}

export function BookingModal({
  slot,
  coachName,
  isAuthenticated,
}: {
  slot: BookingSlotInfo
  coachName: string
  isAuthenticated: boolean
}) {
  const [state, formAction, pending] = useActionState(createBooking, initialState)

  if (!isAuthenticated) {
    return (
      <Button render={<Link href="/login" />} nativeButton={false}>
        Записаться
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Записаться</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение записи</DialogTitle>
          <DialogDescription>
            Тренировка с {coachName} —{" "}
            {capitalize(dateFormatter.format(slot.startsAt))},{" "}
            {timeFormatter.format(slot.startsAt)}–
            {timeFormatter.format(slot.endsAt)}
            <br />
            {slot.location}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Стоимость</span>
          <span className="text-lg font-semibold text-foreground">
            {priceFormatter.format(slot.price)}
          </span>
        </div>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="slotId" value={slot.id} />
          <div className="space-y-1.5">
            <Label htmlFor="promoCode">Промокод (необязательно)</Label>
            <Input
              id="promoCode"
              name="promoCode"
              placeholder="Например, BREAKPOINT10"
              className="uppercase placeholder:normal-case"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Записываем…" : "Подтвердить и перейти к оплате"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
