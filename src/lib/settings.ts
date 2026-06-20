import { prisma } from "@/lib/prisma"

export async function getAdminSettings() {
  return prisma.adminSettings.findUniqueOrThrow({ where: { id: "singleton" } })
}
