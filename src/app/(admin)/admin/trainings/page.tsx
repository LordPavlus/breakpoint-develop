import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  capitalize,
  dateFormatter,
  priceFormatter,
  timeFormatter,
} from "@/app/trainings/components/TrainingSlotCard"
import type { TrainingSlot } from "@prisma/client"

const statusLabels: Record<TrainingSlot["status"], string> = {
  AVAILABLE: "Свободен",
  BOOKED: "Забронирован",
  CANCELLED: "Отменён",
  COMPLETED: "Завершён",
}

const statusVariants: Record<
  TrainingSlot["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  AVAILABLE: "secondary",
  BOOKED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
}

export default async function AdminTrainingsPage() {
  const slots = await prisma.trainingSlot.findMany({
    include: {
      coach: { include: { user: true } },
      booking: { include: { player: true } },
    },
    orderBy: { startsAt: "desc" },
  })

  return (
    <div className="space-y-4">
      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">Слотов пока нет.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Тренер</TableHead>
              <TableHead>Дата и время</TableHead>
              <TableHead>Место</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Игрок</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((slot) => {
              const coachName = slot.coach.user.name ?? slot.coach.user.email ?? "—"

              return (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium text-foreground">
                    {coachName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {capitalize(dateFormatter.format(slot.startsAt))},{" "}
                    {timeFormatter.format(slot.startsAt)}–
                    {timeFormatter.format(slot.endsAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {slot.location}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {priceFormatter.format(slot.price.toNumber())}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {slot.booking?.player.name ?? slot.booking?.player.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[slot.status]}>
                      {statusLabels[slot.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/trainings/${slot.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Подробнее
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
