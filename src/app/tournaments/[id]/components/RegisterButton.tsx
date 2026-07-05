"use client"

import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  registerForTournament,
  type RegisterForTournamentState,
} from "@/server/actions/tournaments"
import { priceFormatter } from "@/app/trainings/components/TrainingSlotCard"

const initialState: RegisterForTournamentState = {}

export function RegisterButton({
  tournamentId,
  title,
  entryFee,
  isAuthenticated,
  isRegistered,
  registrationOpen,
}: {
  tournamentId: string
  title: string
  entryFee: number
  isAuthenticated: boolean
  isRegistered: boolean
  registrationOpen: boolean
}) {
  const [state, formAction, pending] = useActionState(
    registerForTournament,
    initialState
  )

  if (isRegistered) {
    return (
      <Button disabled className="w-full sm:w-auto">
        Вы участвуете
      </Button>
    )
  }

  if (!registrationOpen) {
    return (
      <Button disabled variant="outline" className="w-full sm:w-auto">
        Регистрация закрыта
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        className="w-full sm:w-auto"
      >
        Участвовать
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
        Участвовать
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение регистрации</DialogTitle>
          <DialogDescription>Турнир «{title}»</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Взнос за участие</span>
          <span className="text-lg font-semibold text-foreground">
            {priceFormatter.format(entryFee)}
          </span>
        </div>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="tournamentId" value={tournamentId} />
          <div className="space-y-1.5">
            <Label htmlFor="promoCode">Промокод (необязательно)</Label>
            <Input
              id="promoCode"
              name="promoCode"
              placeholder="Например, BREAKPOINT10"
              className="uppercase placeholder:normal-case"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Регистрируем…" : "Подтвердить и перейти к оплате"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
