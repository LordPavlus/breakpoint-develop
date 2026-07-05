import type { Payment } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { priceFormatter, dateFormatter } from "@/app/trainings/components/TrainingSlotCard"
import { MarkTournamentRefundButton } from "./MarkTournamentRefundButton"

const purposeLabels: Record<Payment["purpose"], string> = {
  TRAINING_BOOKING: "Тренировка",
  TOURNAMENT_ENTRY: "Турнир",
}

const statusLabels: Record<Payment["status"], string> = {
  PENDING: "Ожидает",
  SUCCEEDED: "Оплачено",
  CANCELED: "Отменено",
  REFUNDED: "Возврат",
}

const statusVariants: Record<
  Payment["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  SUCCEEDED: "default",
  CANCELED: "destructive",
  REFUNDED: "outline",
}

export default async function AdminPaymentsPage() {
  const [payments, needsManualRefund] = await Promise.all([
    prisma.payment.findMany({
      include: { payer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tournamentRegistration.findMany({
      where: {
        status: "PAID",
        tournament: { status: "CANCELLED" },
        payment: { status: "SUCCEEDED" },
      },
      include: { tournament: true, player: true, payment: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  return (
    <div className="space-y-10">
      {needsManualRefund.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Требуют возврата</h2>
          <p className="text-sm text-muted-foreground">
            Турнир отменён, взнос оплачен, но возврат ещё не выполнен — переведите
            деньги игроку и отметьте возврат.
          </p>
          <div className="space-y-3">
            {needsManualRefund.map((registration) => (
              <div
                key={registration.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {registration.player.name ?? registration.player.email ?? "Игрок"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {registration.tournament.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {priceFormatter.format(registration.payment!.amount.toNumber())}
                  </p>
                </div>
                <MarkTournamentRefundButton registrationId={registration.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Все платежи</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Платежей пока нет.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Плательщик</TableHead>
                <TableHead>Назначение</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-foreground">
                    {payment.payer.name ?? payment.payer.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {purposeLabels[payment.purpose]}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {priceFormatter.format(payment.amount.toNumber())}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[payment.status]}>
                      {statusLabels[payment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(payment.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
