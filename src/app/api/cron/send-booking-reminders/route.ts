import { NextResponse } from "next/server"

import { sendDueBookingReminders } from "@/lib/reminders/bookings"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const result = await sendDueBookingReminders()

  return NextResponse.json(result)
}
