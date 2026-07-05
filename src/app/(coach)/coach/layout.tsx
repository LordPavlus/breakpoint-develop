import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { CoachTabs } from "./CoachTabs"

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "COACH") {
    redirect("/")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Кабинет тренера
      </h1>
      <CoachTabs />
      <div className="mt-6">{children}</div>
    </div>
  )
}
