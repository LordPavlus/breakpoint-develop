import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { AdminTabs } from "./AdminTabs"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Админ-панель
      </h1>
      <AdminTabs />
      <div className="mt-6">{children}</div>
    </div>
  )
}
