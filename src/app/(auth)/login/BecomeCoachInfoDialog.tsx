"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function BecomeCoachInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" className="mx-auto" />}>
        Хотите тренировать? Подать заявку тренера
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Как стать тренером</DialogTitle>
          <DialogDescription>
            Сначала зарегистрируйтесь как пользователь — а затем в личном кабинете нажмите
            кнопку «Стать тренером», чтобы подать заявку.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button />}>Понятно</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
