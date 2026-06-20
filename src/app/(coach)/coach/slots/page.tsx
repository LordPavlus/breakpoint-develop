import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarDays, MapPin, Plus } from "lucide-react"
import type { Prisma } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  capitalize,
  dateFormatter,
  priceFormatter,
  timeFormatter,
} from "@/app/trainings/components/TrainingSlotCard"
import { CancelSlotButton } from "./CancelSlotButton"

type SlotWithBooking = Prisma.TrainingSlotGetPayload<{
  include: { booking: { include: { player: true } } }
}>

const statusLabels: Record<SlotWithBooking["status"], string> = {
  AVAILABLE: "Свободен",
  BOOKED: "Забронирован",
  CANCELLED: "Отменён",
  COMPLETED: "Завершён",
}

const statusVariants: Record<
  SlotWithBooking["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  AVAILABLE: "secondary",
  BOOKED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
}

export default async function CoachSlotsPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const coach = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId },
  })

  const slots = await prisma.trainingSlot.findMany({
    where: { coachId: coach.id },
    include: { booking: { include: { player: true } } },
    orderBy: { startsAt: "desc" },
  })

  const now = new Date()
  const upcoming = slots.filter((slot) => slot.startsAt > now)
  const past = slots.filter((slot) => slot.startsAt <= now)

  return (
    <div className="space-y-10">
      <div className="flex justify-end">
        <Button render={<Link href="/coach/slots/new" />} nativeButton={false}>
          <Plus className="size-4" />
          Новый слот
        </Button>
      </div>

      <SlotSection
        title="Предстоящие"
        slots={upcoming}
        emptyText="Нет предстоящих слотов."
      />
      <SlotSection title="Прошедшие" slots={past} emptyText="История пуста." />
    </div>
  )
}

function SlotSection({
  title,
  slots,
  emptyText,
}: {
  title: string
  slots: SlotWithBooking[]
  emptyText: string
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => (
            <SlotRow key={slot.id} slot={slot} />
          ))}
        </div>
      )}
    </section>
  )
}

function SlotRow({ slot }: { slot: SlotWithBooking }) {
  const canCancel = slot.status === "AVAILABLE" && slot.startsAt > new Date()

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="size-4" />
            {capitalize(dateFormatter.format(slot.startsAt))},{" "}
            {timeFormatter.format(slot.startsAt)}–{timeFormatter.format(slot.endsAt)}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {slot.location}
          </p>
          {slot.booking && (
            <p className="text-sm text-muted-foreground">
              Игрок: {slot.booking.player.name ?? slot.booking.player.email}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-semibold text-foreground">
            {priceFormatter.format(slot.price.toNumber())}
          </span>
          <Badge variant={statusVariants[slot.status]}>
            {statusLabels[slot.status]}
          </Badge>
        </div>
      </div>

      {canCancel && (
        <div className="mt-3">
          <CancelSlotButton slotId={slot.id} />
        </div>
      )}
    </div>
  )
}
