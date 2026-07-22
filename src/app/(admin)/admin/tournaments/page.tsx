import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { TournamentsAdminList } from "./TournamentsAdminList"

export default async function AdminTournamentsPage() {
  const raw = await prisma.tournament.findMany({
    include: { _count: { select: { registrations: true } } },
    orderBy: { startsAt: "asc" },
  })

  // Конвертируем Decimal → number перед передачей в Client Component
  const tournaments = raw.map((t) => ({
    ...t,
    entryFee: t.entryFee.toNumber(),
  }))

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
        <TournamentsAdminList tournaments={tournaments} />
      )}
    </div>
  )
}
