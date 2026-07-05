import { NextResponse } from "next/server"

import { sendDueTournamentReminders } from "@/lib/reminders/tournaments"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const result = await sendDueTournamentReminders()

  return NextResponse.json(result)
}
