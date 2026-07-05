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
import { Input } from "@/components/ui/input"
import {
  submitMatchResult,
  type SubmitMatchResultState,
} from "@/server/actions/matches"

const initialState: SubmitMatchResultState = {}

export function MatchResultForm({
  matchId,
  player1Name,
  player2Name,
}: {
  matchId: string
  player1Name: string
  player2Name: string
}) {
  const [state, formAction, pending] = useActionState(submitMatchResult, initialState)

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Ввести результат
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Результат матча</DialogTitle>
          <DialogDescription>
            {player1Name} — {player2Name}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="matchId" value={matchId} />
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem_3.5rem] items-center gap-2">
            <span />
            <span className="text-center text-xs text-muted-foreground">Сет 1</span>
            <span className="text-center text-xs text-muted-foreground">Сет 2</span>
            <span className="text-center text-xs text-muted-foreground">Сет 3</span>

            <span className="truncate text-sm text-foreground">{player1Name}</span>
            <Input name="set1p1" type="number" min={0} className="text-center" />
            <Input name="set2p1" type="number" min={0} className="text-center" />
            <Input name="set3p1" type="number" min={0} className="text-center" />

            <span className="truncate text-sm text-foreground">{player2Name}</span>
            <Input name="set1p2" type="number" min={0} className="text-center" />
            <Input name="set2p2" type="number" min={0} className="text-center" />
            <Input name="set3p2" type="number" min={0} className="text-center" />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохраняем…" : "Сохранить результат"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
