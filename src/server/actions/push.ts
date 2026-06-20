"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type PushSubscriptionInput = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function subscribeToPush(
  subscription: PushSubscriptionInput
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Не авторизован" }
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    update: {
      userId: session.user.id,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  })

  return {}
}

export async function unsubscribeFromPush(endpoint: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: "Не авторизован" }
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  })

  return {}
}
