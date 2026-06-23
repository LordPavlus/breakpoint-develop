import { notFound } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"
import { TournamentInfo } from "./components/TournamentInfo"
import { GroupStandingsTable } from "./components/GroupStandingsTable"
import { PlayoffBracket } from "./components/PlayoffBracket"

export default async function TournamentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ registered?: string }>
}) {
  const [{ id }, { registered }, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ])

  const tournament = await prisma.tournament.findUnique({ where: { id } })

  if (!tournament) {
    notFound()
  }

  const userId = session?.user?.id

  const [registrationsCount, myRegistration, groups, playoffMatches] = await Promise.all([
    prisma.tournamentRegistration.count({
      where: { tournamentId: id, status: { not: "CANCELLED" } },
    }),
    userId
      ? prisma.tournamentRegistration.findUnique({
          where: { tournamentId_playerId: { tournamentId: id, playerId: userId } },
          include: { payment: { select: { confirmationUrl: true } } },
        })
      : Promise.resolve(null),
    prisma.tournamentGroup.findMany({
      where: { tournamentId: id },
      orderBy: { name: "asc" },
      include: {
        standings: { include: { player: { select: { name: true } } } },
      },
    }),
    prisma.match.findMany({
      where: { tournamentId: id, stage: { not: "GROUP" } },
      include: {
        player1: { select: { id: true, name: true } },
        player2: { select: { id: true, name: true } },
      },
    }),
  ])

  const showRegisteredBanner =
    registered && myRegistration?.id === registered ? myRegistration : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {showRegisteredBanner && (
        <div className="mb-8 flex items-start gap-3 rounded-xl bg-primary/10 p-4 text-sm ring-1 ring-primary/20">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Регистрация оформлена</p>
            <p className="text-muted-foreground">
              Вы зарегистрированы на турнир «{tournament.title}». Взнос к
              оплате: {priceFormatter.format(tournament.entryFee.toNumber())}.
              Онлайн-оплата подключается — мы свяжемся с вами для
              подтверждения.
            </p>
          </div>
        </div>
      )}

      <TournamentInfo
        tournament={tournament}
        registrationsCount={registrationsCount}
        isAuthenticated={Boolean(userId)}
        isRegistered={Boolean(myRegistration)}
        isPendingPayment={myRegistration?.status === "PENDING_PAYMENT"}
        paymentUrl={myRegistration?.payment?.confirmationUrl ?? null}
      />

      {groups.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Групповой этап
          </h2>
          <GroupStandingsTable groups={groups} />
        </div>
      )}

      {playoffMatches.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Плей-офф
          </h2>
          <PlayoffBracket matches={playoffMatches} />
        </div>
      )}
    </div>
  )
}
