"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

const DISMISS_KEY = "bp-install-dismissed"

type PromptMode = "hidden" | "ios" | "browser"

function subscribe() {
  return () => {}
}

function getSnapshot(): PromptMode {
  if (localStorage.getItem(DISMISS_KEY)) return "hidden"

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  if (standalone) return "hidden"

  return /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : "browser"
}

function getServerSnapshot(): PromptMode {
  return "hidden"
}

export function InstallPrompt() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [dismissed, setDismissed] = useState(false)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  )

  useEffect(() => {
    if (mode !== "browser") return

    const handler = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [mode])

  if (dismissed || mode === "hidden") return null
  if (mode === "browser" && !installEvent) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }

  const install = async () => {
    await installEvent?.prompt()
    dismiss()
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-card-foreground shadow-lg sm:inset-x-0">
      <p className="flex-1 text-sm">
        {mode === "ios"
          ? "Установите Break Point: нажмите «Поделиться» и выберите «На экран «Домой»»."
          : "Установите Break Point на устройство для быстрого доступа."}
      </p>
      {mode === "browser" && (
        <Button size="sm" onClick={install}>
          Установить
        </Button>
      )}
      <Button size="icon-sm" variant="ghost" onClick={dismiss} aria-label="Закрыть">
        <X className="size-4" />
      </Button>
    </div>
  )
}
