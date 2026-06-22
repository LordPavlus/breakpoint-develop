"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function YandexLoginButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => signIn("yandex", { callbackUrl: "/" })}
    >
      Войти через Яндекс ID
    </Button>
  )
}

export function VKLoginButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => signIn("vk", { callbackUrl: "/" })}
    >
      Войти через VK ID (OAuth)
    </Button>
  )
}
