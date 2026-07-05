import { prisma } from "@/lib/prisma"
import { pushConfigured, webpush } from "@/lib/push/vapid"

export type PushPayload = {
  title: string
  body: string
  url?: string
}

// Шлёт push-уведомление на все устройства пользователя. Если VAPID не
// настроен (нет ключей) — просто логирует, как и lib/email/* при отсутствии
// RESEND_API_KEY. Подписки, на которые push больше не доставляется (404/410 —
// пользователь отписался/удалил браузер), удаляются из БД.
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!pushConfigured) {
    console.log(`[push] VAPID не настроен — уведомление "${payload.title}" для ${userId}`)
    return
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } })
  if (subscriptions.length === 0) return

  const body = JSON.stringify(payload)

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body
        )
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {})
        } else {
          console.error("[push] sendNotification failed", error)
        }
      }
    })
  )
}
