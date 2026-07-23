import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CoachApplicationActions } from "./CoachApplicationActions"

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})

const statusLabels = {
  PENDING: "На рассмотрении",
  APPROVED: "Одобрена",
  REJECTED: "Отклонена",
} as const

const statusVariants = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
} as const

export default async function AdminCoachApplicationsPage() {
  const applications = await prisma.coachApplication.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })

  const pending = applications.filter((app) => app.status === "PENDING")
  const reviewed = applications.filter((app) => app.status !== "PENDING")

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Ожидают рассмотрения {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Новых заявок нет.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((app) => (
              <Card key={app.id}>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {app.user.name ?? "Без имени"}
                      </p>
                      <p className="text-sm text-muted-foreground">{app.user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(app.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{app.bio}</p>
                  {app.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {app.specialization.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <CoachApplicationActions applicationId={app.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">История рассмотрения</h2>
          <div className="space-y-2">
            {reviewed.map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-card p-3 text-sm ring-1 ring-foreground/10"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {app.user.name ?? app.user.email}
                  </span>
                  {app.reviewedAt && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {dateFormatter.format(app.reviewedAt)}
                    </span>
                  )}
                </div>
                <Badge variant={statusVariants[app.status]}>{statusLabels[app.status]}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
