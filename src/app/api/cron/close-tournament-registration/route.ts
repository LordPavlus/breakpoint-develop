import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { closeRegistrationAndAdvance } from "@/lib/tournament/lifecycle"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const tournaments = await prisma.tournament.findMany({
    where: { status: "REGISTRATION_OPEN", registrationDeadline: { lte: new Date() } },
    select: { id: true },
  })

  const results = []
  for (const { id } of tournaments) {
    const result = await closeRegistrationAndAdvance(id)
    results.push({
      tournamentId: id,
      status: result.status,
      ...(result.status === "CANCELLED" ? { refunds: result.refunds } : {}),
    })
  }

  return NextResponse.json({ processed: results.length, results })
}
