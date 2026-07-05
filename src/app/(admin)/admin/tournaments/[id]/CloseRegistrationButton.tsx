"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  closeTournamentRegistration,
  type CloseTournamentRegistrationState,
} from "@/server/actions/tournaments"

const initialState: CloseTournamentRegistrationState = {}

export function CloseRegistrationButton({ tournamentId }: { tournamentId: string }) {
  const [state, formAction, pending] = useActionState(
    closeTournamentRegistration,
    initialState
  )

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        Закрыть регистрацию
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Закрыть регистрацию</DialogTitle>
          <DialogDescription>
            Регистрация будет закрыта, участники распределены по группам или
            сетке плей-офф. Если набралось меньше минимального числа
            участников — турнир будет отменён. Действие необратимо.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="tournamentId" value={tournamentId} />
          {state?.error && (
            <p className="mb-2 text-sm text-destructive">{state.error}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Обрабатываем…" : "Закрыть регистрацию"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
