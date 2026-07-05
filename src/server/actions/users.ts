"use server"

import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type UpdateUserRoleState = {
  error?: string
}

const roleValues = new Set<string>(Object.values(UserRole))

export async function updateUserRole(
  _prevState: UpdateUserRoleState,
  formData: FormData
): Promise<UpdateUserRoleState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Не авторизован" }
  }

  const userId = String(formData.get("userId") ?? "")
  const roleRaw = String(formData.get("role") ?? "")

  if (!userId || !roleValues.has(roleRaw)) {
    return { error: "Некорректные данные" }
  }
  if (userId === session.user.id) {
    return { error: "Нельзя изменить свою роль" }
  }

  const role = roleRaw as UserRole

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role } })

    if (role === "COACH") {
      await tx.coachProfile.upsert({
        where: { userId },
        update: {},
        create: { userId, specialization: [] },
      })
    }
  })

  revalidatePath("/admin/users")
  return {}
}
