import Link from "next/link"
import { CalendarDays, MapPin, Star, Users } from "lucide-react"
import type { Prisma } from "@prisma/client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookingModal } from "./BookingModal"

export type TrainingSlotWithCoach = Prisma.TrainingSlotGetPayload<{
  include: { coach: { include: { user: true } } }
}>

export const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
})

export const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "numeric",
  month: "long",
})

export const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
})

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function TrainingSlotCard({
  slot,
  isAuthenticated,
}: {
  slot: TrainingSlotWithCoach
  isAuthenticated: boolean
}) {
  const coachName = slot.coach.user.name ?? "Тренер"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>{initials(coachName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">
              <Link
                href={`/trainings/${slot.id}`}
                className="hover:underline"
              >
                {coachName}
              </Link>
            </CardTitle>
            {slot.coach.ratingAvg != null && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-3.5 fill-primary text-primary" />
                {slot.coach.ratingAvg.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          {capitalize(dateFormatter.format(slot.startsAt))},{" "}
          {timeFormatter.format(slot.startsAt)}–{timeFormatter.format(slot.endsAt)}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4" />
          {slot.location}
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4" />
          Занято: 0 / 1
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground">
          {priceFormatter.format(slot.price.toNumber())}
        </span>
        <BookingModal
          slot={{
            id: slot.id,
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
            location: slot.location,
            price: slot.price.toNumber(),
          }}
          coachName={coachName}
          isAuthenticated={isAuthenticated}
        />
      </CardFooter>
    </Card>
  )
}
