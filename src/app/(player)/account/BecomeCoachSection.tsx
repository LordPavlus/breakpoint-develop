import Link from "next/link"
import type { CoachApplicationStatus, UserRole } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function BecomeCoachSection({
  role,
  applicationStatus,
}: {
  role: UserRole
  applicationStatus: CoachApplicationStatus | null
}) {
  if (role === "COACH" || role === "ADMIN") {
    return null
  }

  if (applicationStatus === "PENDING") {
    return (
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Badge variant="secondary">Заявка на тренера на рассмотрении</Badge>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Результат придёт на вашу почту.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div>
        <p className="font-medium text-foreground">Хотите тренировать?</p>
        <p className="text-sm text-muted-foreground">
          {applicationStatus === "REJECTED"
            ? "Заявка была отклонена — можно подать её ещё раз."
            : "Подайте заявку на статус тренера."}
        </p>
      </div>
      <Button render={<Link href="/become-coach" />} nativeButton={false}>
        Стать тренером
      </Button>
    </div>
  )
}
