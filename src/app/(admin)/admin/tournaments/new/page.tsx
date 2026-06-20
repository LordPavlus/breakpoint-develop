import { TournamentForm } from "./TournamentForm"

export default function NewTournamentPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Новый турнир</h2>
      <TournamentForm />
    </div>
  )
}
