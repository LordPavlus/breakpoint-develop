import { notFound } from "next/navigation"
import { CalendarDays, Clock, MapPin, Star } from "lucide-react"
import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  capitalize,
  dateFormatter,
  priceFormatter,
  timeFormatter,
} from "@/app/trainings/components/TrainingSlotCard"

type BookingWithPlayer = Prisma.BookingGetPayload<{
  include: { player: true; review: true }
}>

const slotStatusLabels = {
  AVAILABLE: "Свободен",
  BOOKED: "Забронирован",
  CANCELLED: "Отменён",
  COMPLETED: "Завершён",
} as const

const slotStatusVariants = {
  AVAILABLE: "secondary",
  BOOKED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
} as const

const bookingStatusLabels = {
  PENDING_PAYMENT: "Ожидает оплаты",
  PAID: "Оплачено",
  CANCELLED: "Отменено",
  COMPLETED_CONFIRMED: "Завершено",
} as const

const bookingStatusVariants = {
  PENDING_PAYMENT: "secondary",
  PAID: "default",
  CANCELLED: "destructive",
  COMPLETED_CONFIRMED: "outline",
} as const

function durationLabel(startsAt: Date, endsAt: Date) {
  const minutes = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000)
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours} ч ${rest} мин` : `${hours} ч`
}

export default async function AdminTrainingSlotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const slot = await prisma.trainingSlot.findUnique({
    where: { id },
    include: {
      coach: { include: { user: true } },
      booking: { include: { player: true, review: true } },
    },
  })

  if (!slot) {
    notFound()
  }

  const coachName = slot.coach.user.name ?? slot.coach.user.email ?? "Тренер"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Слот тренера {coachName}
            </h1>
            <Badge variant={slotStatusVariants[slot.status]}>
              {slotStatusLabels[slot.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {capitalize(dateFormatter.format(slot.startsAt))},{" "}
            {timeFormatter.format(slot.startsAt)}–
            {timeFormatter.format(slot.endsAt)} ·{" "}
            {durationLabel(slot.startsAt, slot.endsAt)} · {slot.location} ·{" "}
            {priceFormatter.format(slot.price.toNumber())}
          </p>
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Тренер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-foreground">{coachName}</p>
            {slot.coach.ratingAvg != null && (
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-3.5 fill-primary text-primary" />
                {slot.coach.ratingAvg.toFixed(1)} ({slot.coach.ratingCount})
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Дата и время
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CalendarDays className="size-4 text-muted-foreground" />
              {capitalize(dateFormatter.format(slot.startsAt))}
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="size-4 text-muted-foreground" />
              {timeFormatter.format(slot.startsAt)}–
              {timeFormatter.format(slot.endsAt)}{" "}
              <span className="text-muted-foreground">
                ({durationLabel(slot.startsAt, slot.endsAt)})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="size-4 text-muted-foreground" />
              {slot.location}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Стоимость
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {priceFormatter.format(slot.price.toNumber())}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Booking */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Бронирование
        </h2>
        {!slot.booking ? (
          <p className="text-sm text-muted-foreground">Нет бронирований.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Игрок</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Отзыв</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <BookingRow booking={slot.booking} />
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}

function BookingRow({ booking }: { booking: BookingWithPlayer }) {
  const playerName = booking.player.name ?? "—"

  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">{playerName}</TableCell>
      <TableCell className="text-muted-foreground">
        {booking.player.email}
      </TableCell>
      <TableCell className="text-foreground">
        {priceFormatter.format(booking.priceAtBooking.toNumber())}
      </TableCell>
      <TableCell>
        <Badge variant={bookingStatusVariants[booking.status]}>
          {bookingStatusLabels[booking.status]}
        </Badge>
      </TableCell>
      <TableCell>
        {booking.review ? (
          <div className="flex items-center gap-1 text-sm">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={cn(
                  "size-3.5",
                  value <= booking.review!.rating
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}
