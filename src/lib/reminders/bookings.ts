import { prisma } from "@/lib/prisma"
import { sendBookingReminderEmail } from "@/lib/email/send-booking-reminder"
import { sendPushToUser } from "@/lib/push/send"

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
})

// Находит оплаченные бронирования, чья тренировка начнётся в ближайшие 24ч и
// для которых напоминание ещё не отправлено, и рассылает напоминания.
export async function sendDueBookingReminders(): Promise<{ sent: number }> {
  const now = new Date()
  const threshold = new Date(now.getTime() + REMINDER_WINDOW_MS)

  const bookings = await prisma.booking.findMany({
    where: {
      status: "PAID",
      reminderSentAt: null,
      slot: { startsAt: { gt: now, lte: threshold } },
    },
    include: {
      player: { select: { email: true } },
      slot: { include: { coach: { include: { user: { select: { name: true } } } } } },
    },
  })

  let sent = 0
  for (const booking of bookings) {
    if (booking.player.email) {
      await sendBookingReminderEmail(booking.player.email, {
        coachName: booking.slot.coach.user.name ?? "тренер",
        startsAt: booking.slot.startsAt,
        location: booking.slot.location,
      })
      sent++
    }

    await sendPushToUser(booking.playerId, {
      title: "Напоминание о тренировке",
      body: `Завтра в ${timeFormatter.format(booking.slot.startsAt)} — тренировка с ${booking.slot.coach.user.name ?? "тренером"} (${booking.slot.location})`,
      url: "/account/bookings",
    })

    await prisma.booking.update({
      where: { id: booking.id },
      data: { reminderSentAt: now },
    })
  }

  return { sent }
}
