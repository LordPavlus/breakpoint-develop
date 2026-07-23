import { notFound } from "next/navigation"
import { CalendarCheck, Star, Trophy } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrainingSlotCard, dateFormatter } from "@/app/trainings/components/TrainingSlotCard"
import { PhotoLightboxItem } from "@/components/profile/PhotoLightboxItem"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
}

export default async function CoachPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const coach = await prisma.coachProfile.findUnique({
    where: { id },
    include: {
      user: true,
      photos: { orderBy: { createdAt: "desc" } },
      reviews: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!coach) {
    notFound()
  }

  const [completedCount, upcomingSlots, session] = await Promise.all([
    prisma.booking.count({
      where: { slot: { coachId: coach.id }, status: "COMPLETED_CONFIRMED" },
    }),
    prisma.trainingSlot.findMany({
      where: { coachId: coach.id, status: "AVAILABLE", startsAt: { gt: new Date() } },
      include: { coach: { include: { user: true } } },
      orderBy: { startsAt: "asc" },
    }),
    auth(),
  ])

  const isAuthenticated = Boolean(session?.user)
  const coachName = coach.user.name ?? "Тренер"

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-start gap-5">
        <Avatar size="lg">
          {coach.user.image && <AvatarImage src={coach.user.image} alt={coachName} />}
          <AvatarFallback className="text-xl">{initials(coachName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {coachName}
          </h1>
          {coach.ratingAvg != null && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="size-4 fill-primary text-primary" />
              <span className="font-medium text-foreground">{coach.ratingAvg.toFixed(1)}</span>
              <span>· {coach.ratingCount} отзывов</span>
            </div>
          )}
          {coach.specialization.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {coach.specialization.map((spec) => (
                <Badge key={spec} variant="secondary">
                  {spec}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <CalendarCheck className="size-6 text-primary" />
            <div>
              <p className="text-2xl font-semibold text-foreground">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Проведено тренировок</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Star className="size-6 text-primary" />
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {coach.ratingAvg != null ? coach.ratingAvg.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Рейтинг · {coach.ratingCount} отзывов
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {upcomingSlots.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Предстоящие тренировки</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {upcomingSlots.map((slot) => (
              <TrainingSlotCard key={slot.id} slot={slot} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        </div>
      )}

      {coach.achievements && (
        <div className="mb-8">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Trophy className="size-5 text-primary" />
            Звания и достижения
          </h2>
          <p className="text-sm whitespace-pre-line text-muted-foreground">
            {coach.achievements}
          </p>
        </div>
      )}

      {coach.bio && (
        <div className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-foreground">О тренере</h2>
          <p className="text-sm whitespace-pre-line text-muted-foreground">{coach.bio}</p>
        </div>
      )}

      {coach.photos.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Фото с тренировок</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {coach.photos.map((photo) => (
              <PhotoLightboxItem
                key={photo.id}
                url={photo.url}
                className="aspect-square overflow-hidden rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      <Separator className="mb-8" />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Отзывы {coach.reviews.length > 0 && `(${coach.reviews.length})`}
        </h2>
        {coach.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет отзывов.</p>
        ) : (
          <div className="space-y-4">
            {coach.reviews.map((review) => (
              <div key={review.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {review.author.name ?? "Игрок"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {dateFormatter.format(review.createdAt)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1">
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
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
