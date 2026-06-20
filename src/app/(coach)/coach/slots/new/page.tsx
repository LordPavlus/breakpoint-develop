import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getAdminSettings } from "@/lib/settings"
import { NewSlotForm } from "./NewSlotForm"

export default async function NewSlotPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }
  if (session.user.role !== "COACH") {
    redirect("/")
  }

  const settings = await getAdminSettings()

  return (
    <NewSlotForm
      minPrice={settings.minTrainingPrice.toNumber()}
      maxPrice={settings.maxTrainingPrice.toNumber()}
    />
  )
}
