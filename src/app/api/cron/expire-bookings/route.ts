import { NextResponse } from "next/server"

import { expireStaleBookings } from "@/lib/expiry/bookings"
import { expireStaleTournamentRegistrations } from "@/lib/expiry/tournaments"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const bookings = await expireStaleBookings()
  const tournamentRegistrations = await expireStaleTournamentRegistrations()

  return NextResponse.json({ bookings, tournamentRegistrations })
}
