import { prisma } from "@/lib/prisma"
import { TournamentCard } from "./components/TournamentCard"

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    where: { status: "REGISTRATION_OPEN" },
    orderBy: { startsAt: "asc" },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Турниры
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Турниры по уровню NTRP с групповым этапом и сеткой плей-офф.
          Регистрация и оплата взноса — через ЮKassa.
        </p>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-muted-foreground">
          Сейчас нет турниров с открытой регистрацией. Загляните позже.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  )
}
