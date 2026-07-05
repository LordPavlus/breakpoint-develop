"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { recordMatchResult } from "@/lib/tournament/matches"

export type SubmitMatchResultState = {
  error?: string
}

export async function submitMatchResult(
  _prevState: SubmitMatchResultState,
  formData: FormData
): Promise<SubmitMatchResultState> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const matchId = String(formData.get("matchId") ?? "")
  if (!matchId) {
    return { error: "Матч не указан" }
  }

  const sets: [number, number][] = []
  for (let i = 1; i <= 3; i++) {
    const p1Raw = formData.get(`set${i}p1`)
    const p2Raw = formData.get(`set${i}p2`)
    if (!p1Raw && !p2Raw) continue

    const p1 = Number(p1Raw)
    const p2 = Number(p2Raw)

    if (!Number.isFinite(p1) || !Number.isFinite(p2)) {
      return { error: `Некорректный счёт в сете ${i}` }
    }

    sets.push([p1, p2])
  }

  const result = await recordMatchResult(matchId, sets)

  switch (result.status) {
    case "INVALID_SETS":
      return { error: "Проверьте корректность счёта: нужен хотя бы один сет без равенства, с нечётным числом выигранных сетов" }
    case "NOT_FOUND":
      return { error: "Матч не найден или ещё не готов к вводу результата." }
    case "ALREADY_COMPLETED":
      return { error: "Результат этого матча уже введён." }
  }

  revalidatePath(`/admin/tournaments/${result.tournamentId}`)
  revalidatePath(`/tournaments/${result.tournamentId}`)
  return {}
}
