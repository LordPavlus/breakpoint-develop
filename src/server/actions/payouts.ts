"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computePayoutsForCompletedBookings } from "@/lib/payouts"

export type ComputePayoutsState = {
  error?: string
  success?: string
}

export async function computePayouts(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: ComputePayoutsState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<ComputePayoutsState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const count = await computePayoutsForCompletedBookings()

  revalidatePath("/admin/payouts")
  return {
    success:
      count > 0 ? `Создано новых выплат: ${count}` : "Новых выплат для расчёта нет",
  }
}

export type MarkPayoutPaidState = {
  error?: string
}

export async function markPayoutPaid(
  _prevState: MarkPayoutPaidState,
  formData: FormData
): Promise<MarkPayoutPaidState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const payoutId = String(formData.get("payoutId") ?? "")
  const adminNote = String(formData.get("adminNote") ?? "").trim()

  if (!payoutId) {
    return { error: "Выплата не указана" }
  }

  const updated = await prisma.payout.updateMany({
    where: { id: payoutId, status: "PENDING" },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paidByAdminId: session.user.id,
      adminNote: adminNote || null,
    },
  })

  if (updated.count === 0) {
    return { error: "Выплата уже обработана или не найдена" }
  }

  revalidatePath("/admin/payouts")
  return {}
}
