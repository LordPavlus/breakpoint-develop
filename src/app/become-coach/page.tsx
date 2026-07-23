import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CoachApplicationForm } from "./CoachApplicationForm"

export const dynamic = "force-dynamic"

export default async function BecomeCoachPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }
  if (session.user.role === "COACH") {
    redirect("/coach")
  }

  const application = await prisma.coachApplication.findUnique({ where: { userId } })

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Заявка на статус тренера</CardTitle>
          <CardDescription>
            Расскажите о своём опыте — заявку рассмотрит администратор, результат придёт на
            почту, указанную при регистрации.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {application?.status === "PENDING" ? (
            <div className="space-y-2">
              <Badge variant="secondary">На рассмотрении</Badge>
              <p className="text-sm text-muted-foreground">
                Заявка отправлена и ожидает решения администратора.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {application?.status === "REJECTED" && (
                <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
                  <Badge variant="destructive">Заявка отклонена</Badge>
                  {application.adminNote && (
                    <p className="text-sm text-muted-foreground">{application.adminNote}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Можно отправить заявку ещё раз, учтя комментарий выше.
                  </p>
                </div>
              )}
              <CoachApplicationForm
                bio={application?.bio ?? ""}
                specialization={application?.specialization?.join(", ") ?? ""}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
