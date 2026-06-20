import { NextResponse } from "next/server"

import { handleYookassaWebhook } from "@/lib/yookassa/webhook-handlers"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 })
  }

  const result = await handleYookassaWebhook(body)

  // ЮKassa повторяет вебхук, если не получает 200 — отдаём 200 даже для
  // IGNORED/DUPLICATE, чтобы не получать бесконечные ретраи.
  return NextResponse.json(result)
}
