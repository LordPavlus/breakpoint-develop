import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Clock, MapPin, Star } from "lucide-react"
import { CheckCircle2 } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  TrainingSlotCard,
  capitalize,
  dateFormatter,
  priceFormatter,
  timeFormatter,
} from "@/app/trainings/components/TrainingSlotCard"
import { BookingModal } from "@/app/trainings/components/BookingModal"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function durationLabel(startsAt: Date, endsAt: Date) {
  const minutes = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000)
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours} ч ${rest} мин` : `${hours} ч`
}

export default async function TrainingSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ booked?: string }>
}) {
  const [{ id }, { booked }, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ])

  const slot = await prisma.trainingSlot.findUnique({
    where: { id },
    include: { coach: { include: { user: true } } },
  })

  if (!slot) {
    notFound()
  }

  const userId = session?.user?.id
  const isAuthenticated = Boolean(userId)

  const [myBooking, otherSlots] = await Promise.all([
    userId
      ? prisma.booking.findFirst({
          where: { slotId: id, playerId: userId },
        })
      : Promise.resolve(null),
    prisma.trainingSlot.findMany({
      where: {
        coachId: slot.coachId,
        status: "AVAILABLE",
        startsAt: { gt: new Date() },
        id: { not: id },
      },
      include: { coach: { include: { user: true } } },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
  ])

  const coachName = slot.coach.user.name ?? "Тренер"
  const isBooked = slot.status !== "AVAILABLE"
  const showSuccessBanner =
    booked && myBooking?.id === booked ? myBooking : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/trainings"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Все тренировки
      </Link>

      {showSuccessBanner && (
        <div className="mb-8 flex items-start gap-3 rounded-xl bg-primary/10 p-4 text-sm ring-1 ring-primary/20">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Запись создана</p>
            <p className="text-muted-foreground">
              Тренировка с {coachName} —{" "}
              {capitalize(dateFormatter.format(slot.startsAt))},{" "}
              {timeFormatter.format(slot.startsAt)}. Мы свяжемся с вами для
              подтверждения оплаты.
            </p>
          </div>
        </div>
      )}

      {/* Coach info */}
      <div className="mb-8 flex flex-wrap items-start gap-5">
        <Avatar size="lg">
          <AvatarFallback className="text-xl">{initials(coachName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {coachName}
          </h1>
          {slot.coach.ratingAvg != null && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="size-4 fill-primary text-primary" />
              <span className="font-medium text-foreground">
                {slot.coach.ratingAvg.toFixed(1)}
              </span>
              <span>· {slot.coach.ratingCount} отзывов</span>
            </div>
          )}
          {slot.coach.specialization.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {slot.coach.specialization.map((spec) => (
                <Badge key={spec} variant="secondary">
                  {spec}
                </Badge>
              ))}
            </div>
          )}
          {slot.coach.bio && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {slot.coach.bio}
            </p>
          )}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Slot details */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Дата</p>
                <p className="font-medium text-foreground">
                  {capitalize(dateFormatter.format(slot.startsAt))}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Время</p>
                <p className="font-medium text-foreground">
                  {timeFormatter.format(slot.startsAt)}–
                  {timeFormatter.format(slot.endsAt)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({durationLabel(slot.startsAt, slot.endsAt)})
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Место</p>
                <p className="font-medium text-foreground">{slot.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between gap-4 pt-6">
            <div>
              <p className="text-xs text-muted-foreground">Стоимость</p>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {priceFormatter.format(slot.price.toNumber())}
              </p>
            </div>
            {isBooked ? (
              <Badge variant="secondary" className="w-fit">
                Слот занят
              </Badge>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Other available slots by this coach */}
      {otherSlots.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Другие слоты этого тренера
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherSlots.map((s) => (
              <TrainingSlotCard key={s.id} slot={s} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
