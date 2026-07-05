"use client"

import { useEffect, useId, useRef } from "react"
import type { TelegramWidgetUser } from "@/lib/telegram"

declare global {
  interface Window {
    [key: `onTelegramAuth_${string}`]: ((user: TelegramWidgetUser) => void) | undefined
  }
}

export function TelegramLoginButton({
  botUsername,
  onAuth,
}: {
  botUsername: string
  onAuth: (user: TelegramWidgetUser) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbackName = `onTelegramAuth_${useId().replace(/[^a-zA-Z0-9]/g, "")}`

  useEffect(() => {
    window[callbackName as `onTelegramAuth_${string}`] = onAuth

    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.async = true
    script.setAttribute("data-telegram-login", botUsername)
    script.setAttribute("data-size", "large")
    script.setAttribute("data-radius", "8")
    script.setAttribute("data-onauth", `${callbackName}(user)`)
    script.setAttribute("data-request-access", "write")

    containerRef.current?.appendChild(script)

    return () => {
      delete window[callbackName as `onTelegramAuth_${string}`]
    }
  }, [botUsername, callbackName, onAuth])

  return <div ref={containerRef} />
}
