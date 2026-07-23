import type { Prisma } from "@prisma/client"

type Tx = Prisma.TransactionClient

// Учитывает в CoachProfile.ratingAvg/ratingCount только APPROVED-отзывы —
// PENDING/REJECTED на рейтинг не влияют. Вызывается и при создании
// APPROVED-отзыва напрямую, и при смене статуса модератором.
export async function recalculateCoachRating(tx: Tx, coachId: string) {
  const stats = await tx.review.aggregate({
    where: { coachId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  })

  await tx.coachProfile.update({
    where: { id: coachId },
    data: {
      ratingAvg: stats._avg.rating,
      ratingCount: stats._count.rating,
    },
  })
}
