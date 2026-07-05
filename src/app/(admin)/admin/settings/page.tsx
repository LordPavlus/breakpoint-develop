import { getAdminSettings } from "@/lib/settings"
import { SettingsForm } from "./SettingsForm"

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings()

  return (
    <SettingsForm
      minTrainingPrice={settings.minTrainingPrice.toNumber()}
      maxTrainingPrice={settings.maxTrainingPrice.toNumber()}
      platformCommissionPct={settings.platformCommissionPct.toNumber()}
    />
  )
}
