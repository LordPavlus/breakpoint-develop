"use client"

import { useEffect, useState, useSyncExternalStore, useTransition } from "react"
import { Bell, BellOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { subscribeToPush, unsubscribeFromPush } from "@/server/actions/push"

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

function subscribePushSupport() {
  return () => {}
}

function getPushSupportSnapshot(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window
}

function getPushSupportServerSnapshot(): boolean {
  return false
}

type Status = "loading" | "subscribed" | "unsubscribed"

export function PushNotificationToggle() {
  const supported = useSyncExternalStore(
    subscribePushSupport,
    getPushSupportSnapshot,
    getPushSupportServerSnapshot
  )
  const [status, setStatus] = useState<Status>("loading")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!supported) return

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? "subscribed" : "unsubscribed"))
      .catch(() => setStatus("unsubscribed"))
  }, [supported])

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  if (!supported || status === "loading" || !vapidKey) {
    return null
  }

  const handleSubscribe = () => {
    setError(null)
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          setError("Уведомления заблокированы в браузере")
          return
        }

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        const result = await subscribeToPush(
          subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
        )
        if (result.error) {
          setError(result.error)
          return
        }
        setStatus("subscribed")
      } catch {
        setError("Не удалось включить уведомления")
      }
    })
  }

  const handleUnsubscribe = () => {
    setError(null)
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await unsubscribeFromPush(subscription.endpoint)
          await subscription.unsubscribe()
        }
        setStatus("unsubscribed")
      } catch {
        setError("Не удалось отключить уведомления")
      }
    })
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {status === "subscribed" ? (
            <Bell className="size-4 text-primary" />
          ) : (
            <BellOff className="size-4 text-muted-foreground" />
          )}
          Push-уведомления
        </CardTitle>
        <CardDescription>
          Напоминания о тренировках и турнирах, статусы оплаты и возвратов — на это
          устройство.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {status === "subscribed" ? "Включены для этого устройства" : "Сейчас отключены"}
          </p>
          {status === "subscribed" ? (
            <Button variant="outline" size="sm" disabled={pending} onClick={handleUnsubscribe}>
              Отключить
            </Button>
          ) : (
            <Button size="sm" disabled={pending} onClick={handleSubscribe}>
              Включить
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
