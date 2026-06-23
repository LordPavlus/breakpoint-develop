import { notFound } from "next/navigation"
import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { EditTournamentForm } from "../EditTournamentForm"

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tournament = await prisma.tournament.findUnique({ where: { id } })
  if (!tournament) notFound()

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Редактировать турнир
        </h1>
        <Button render={<Link href={`/admin/tournaments/${id}`} />} nativeButton={false} variant="outline" size="sm">
          ← Назад
        </Button>
      </div>
      <EditTournamentForm tournament={tournament} />
    </div>
  )
}
