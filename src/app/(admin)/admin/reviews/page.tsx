import Link from "next/link"
import { Star } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ReviewActions } from "./ReviewActions"

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})

const statusLabels = {
  PENDING: "На рассмотрении",
  APPROVED: "Одобрен",
  REJECTED: "Отклонён",
} as const

const statusVariants = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
} as const

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { author: true, coach: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  })

  const pending = reviews.filter((r) => r.status === "PENDING")
  const reviewed = reviews.filter((r) => r.status !== "PENDING")

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Ожидают модерации {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Новых отзывов нет.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((review) => (
              <Card key={review.id}>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {review.author.name ?? review.author.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Тренеру:{" "}
                        <Link
                          href={`/coaches/${review.coachId}`}
                          className="text-primary hover:underline"
                        >
                          {review.coach.user.name ?? "без имени"}
                        </Link>
                        {review.bookingId ? " · после тренировки" : " · без брони"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(review.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={
                          value <= review.rating
                            ? "size-4 fill-primary text-primary"
                            : "size-4 text-muted-foreground"
                        }
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground">{review.comment}</p>
                  )}
                  <ReviewActions reviewId={review.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">История модерации</h2>
          <div className="space-y-2">
            {reviewed.map((review) => (
              <div
                key={review.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-card p-3 text-sm ring-1 ring-foreground/10"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {review.author.name ?? review.author.email}
                  </span>
                  <span className="text-muted-foreground"> → {review.coach.user.name}</span>
                  {review.reviewedAt && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {dateFormatter.format(review.reviewedAt)}
                    </span>
                  )}
                </div>
                <Badge variant={statusVariants[review.status]}>
                  {statusLabels[review.status]}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
