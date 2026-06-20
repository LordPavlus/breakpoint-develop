import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { AccountTabs } from "./AccountTabs"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Личный кабинет
      </h1>
      <AccountTabs />
      <div className="mt-6">{children}</div>
    </div>
  )
}
