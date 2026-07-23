import { CheckCircle2 } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  TrainingSlotCard,
  capitalize,
  dateFormatter,
  priceFormatter,
  timeFormatter,
} from "./components/TrainingSlotCard"
import { DateFilter } from "./DateFilter"

// "YYYY-MM-DD" -> границы суток в локальном времени сервера
function parseDateKey(key: string): { start: Date; end: Date } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const [, y, m, d] = match
  const start = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export default async function TrainingsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string; date?: string }>
}) {
  const { booked, date } = await searchParams
  const dayRange = date ? parseDateKey(date) : null

  const now = new Date()
  const rangeStart = dayRange ? (dayRange.start > now ? dayRange.start : now) : now

  const [session, slots] = await Promise.all([
    auth(),
    prisma.trainingSlot.findMany({
      where: {
        status: "AVAILABLE",
        startsAt: { gt: rangeStart, ...(dayRange ? { lt: dayRange.end } : {}) },
      },
      include: { coach: { include: { user: true } } },
      orderBy: { startsAt: "asc" },
    }),
  ])

  const isAuthenticated = Boolean(session?.user)

  const bookedBooking = booked
    ? await prisma.booking.findUnique({
        where: { id: booked },
        include: { slot: { include: { coach: { include: { user: true } } } } },
      })
    : null

  const showBookedBanner =
    bookedBooking && bookedBooking.playerId === session?.user?.id
      ? bookedBooking
      : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Тренировки
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Свободные слоты у тренеров — выберите удобное время, корт и
          записывайтесь.
        </p>
      </div>

      {showBookedBanner && (
        <div className="mb-8 flex items-start gap-3 rounded-xl bg-primary/10 p-4 text-sm ring-1 ring-primary/20">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Запись создана</p>
            <p className="text-muted-foreground">
              Тренировка с {showBookedBanner.slot.coach.user.name ?? "тренером"} —{" "}
              {capitalize(dateFormatter.format(showBookedBanner.slot.startsAt))},{" "}
              {timeFormatter.format(showBookedBanner.slot.startsAt)}. Сумма к
              оплате: {priceFormatter.format(showBookedBanner.priceAtBooking.toNumber())}.
              Онлайн-оплата подключается — мы свяжемся с вами для подтверждения.
            </p>
          </div>
        </div>
      )}

      <DateFilter selected={date} />

      {slots.length === 0 ? (
        <p className="text-muted-foreground">
          {dayRange
            ? "На этот день свободных слотов нет. Попробуйте выбрать другой день."
            : "Сейчас нет свободных слотов. Заходите позже — тренеры регулярно добавляют новые тренировки."}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <TrainingSlotCard
              key={slot.id}
              slot={slot}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  )
}
