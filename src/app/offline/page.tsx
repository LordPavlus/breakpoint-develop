"use client"

import { WifiOff } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="size-6" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Нет подключения к интернету
      </h1>
      <p className="mt-2 text-muted-foreground">
        Похоже, вы offline. Проверьте соединение и попробуйте снова — после
        восстановления связи страница загрузится как обычно.
      </p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        Повторить
      </Button>
    </div>
  )
}
