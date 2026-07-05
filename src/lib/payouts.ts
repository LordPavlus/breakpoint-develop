import { prisma } from "@/lib/prisma"
import { getAdminSettings } from "@/lib/settings"

export async function computePayoutsForCompletedBookings() {
  const settings = await getAdminSettings()
  const commissionPct = settings.platformCommissionPct.toNumber()

  const bookings = await prisma.booking.findMany({
    where: { status: "COMPLETED_CONFIRMED", payout: null },
    include: { slot: true },
  })

  if (bookings.length === 0) {
    return 0
  }

  await prisma.payout.createMany({
    data: bookings.map((booking) => {
      const grossAmount = booking.priceAtBooking.toNumber()
      const commissionAmount = Number(((grossAmount * commissionPct) / 100).toFixed(2))
      const netAmount = Number((grossAmount - commissionAmount).toFixed(2))

      return {
        bookingId: booking.id,
        coachId: booking.slot.coachId,
        grossAmount,
        commissionPct,
        commissionAmount,
        netAmount,
      }
    }),
  })

  return bookings.length
}
