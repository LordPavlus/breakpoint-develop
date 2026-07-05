import type { MetadataRoute } from "next"

import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const tournaments = await prisma.tournament.findMany({
    where: { status: { notIn: ["DRAFT", "CANCELLED"] } },
    select: { id: true, updatedAt: true },
  })

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/trainings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tournaments`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...tournaments.map((tournament) => ({
      url: `${baseUrl}/tournaments/${tournament.id}`,
      lastModified: tournament.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ]
}
