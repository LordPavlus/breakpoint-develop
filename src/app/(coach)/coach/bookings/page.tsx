import { redirect } from "next/navigation"
import { CalendarDays, MapPin, Star } from "lucide-react"
import type { Prisma } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  capitalize,
  dateFormatter,
  priceFormatter,
  timeFormatter,
} from "@/app/trainings/components/TrainingSlotCard"

type BookingWithDetails = Prisma.BookingGetPayload<{
  include: {
    slot: true
    player: true
    review: true
  }
}>

const statusLabels: Record<BookingWithDetails["status"], string> = {
  PENDING_PAYMENT: "Ожидает оплаты",
  PAID: "Оплачено",
  CANCELLED: "Отменено",
  COMPLETED_CONFIRMED: "Завершено",
}

const statusVariants: Record<
  BookingWithDetails["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_PAYMENT: "secondary",
  PAID: "default",
  CANCELLED: "destructive",
  COMPLETED_CONFIRMED: "outline",
}

export default async function CoachBookingsPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const coach = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId },
  })

  const bookings = await prisma.booking.findMany({
    where: { slot: { coachId: coach.id } },
    include: { slot: true, player: true, review: true },
    orderBy: { slot: { startsAt: "desc" } },
  })

  const now = new Date()
  const isUpcoming = (booking: BookingWithDetails) =>
    booking.slot.startsAt > now && booking.status !== "CANCELLED"

  const upcoming = bookings.filter(isUpcoming)
  const past = bookings.filter((booking) => !isUpcoming(booking))

  return (
    <div className="space-y-10">
      <BookingSection
        title="Предстоящие"
        bookings={upcoming}
        emptyText="Нет предстоящих бронирований."
      />
      <BookingSection
        title="Прошедшие"
        bookings={past}
        emptyText="История пуста."
      />
    </div>
  )
}

function BookingSection({
  title,
  bookings,
  emptyText,
}: {
  title: string
  bookings: BookingWithDetails[]
  emptyText: string
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </section>
  )
}

function BookingRow({ booking }: { booking: BookingWithDetails }) {
  const playerName = booking.player.name ?? booking.player.email ?? "Игрок"

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{playerName}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            {capitalize(dateFormatter.format(booking.slot.startsAt))},{" "}
            {timeFormatter.format(booking.slot.startsAt)}–
            {timeFormatter.format(booking.slot.endsAt)}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {booking.slot.location}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-semibold text-foreground">
            {priceFormatter.format(booking.priceAtBooking.toNumber())}
          </span>
          <Badge variant={statusVariants[booking.status]}>
            {statusLabels[booking.status]}
          </Badge>
        </div>
      </div>

      {booking.review && (
        <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={cn(
                  "size-4",
                  value <= booking.review!.rating
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          {booking.review.comment && (
            <p className="mt-1 text-muted-foreground">
              {booking.review.comment}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
