import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"
import {
  formatDateRange,
  formatLabels,
  ntrpRangeLabel,
} from "@/app/tournaments/components/TournamentCard"
import { TournamentStatusSelect } from "./TournamentStatusSelect"

export default async function AdminTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: { _count: { select: { registrations: true } } },
    orderBy: { startsAt: "asc" },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button render={<Link href="/admin/tournaments/new" />} nativeButton={false}>
          Создать турнир
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Турниров пока нет.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Даты</TableHead>
              <TableHead>Формат</TableHead>
              <TableHead>NTRP</TableHead>
              <TableHead>Взнос</TableHead>
              <TableHead>Регистраций</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => {
              const ntrpRange = ntrpRangeLabel(
                tournament.minNtrpLevel,
                tournament.maxNtrpLevel
              )

              return (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link
                      href={`/tournaments/${tournament.id}`}
                      className="hover:underline"
                    >
                      {tournament.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateRange(tournament.startsAt, tournament.endsAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatLabels[tournament.format]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ntrpRange ?? "—"}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {priceFormatter.format(tournament.entryFee.toNumber())}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tournament._count.registrations}
                    {tournament.maxParticipants
                      ? ` / ${tournament.maxParticipants}`
                      : ""}
                  </TableCell>
                  <TableCell>
                    <TournamentStatusSelect
                      tournamentId={tournament.id}
                      status={tournament.status}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/tournaments/${tournament.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Управление
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
