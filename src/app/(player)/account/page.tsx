import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateReferralCode } from "@/lib/referral"
import { PushNotificationToggle } from "@/components/pwa/PushNotificationToggle"
import { AvatarUpload } from "@/components/profile/AvatarUpload"
import { r2Configured } from "@/lib/storage/s3"
import { ProfileForm } from "./ProfileForm"
import { ReferralSection } from "./ReferralSection"
import { TelegramSection } from "./TelegramSection"

export default async function AccountPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { playerProfile: true },
  })

  const [referralCode, referralsCount, bonusCodes] = await Promise.all([
    getOrCreateReferralCode(userId),
    prisma.referral.count({ where: { referrerId: userId } }),
    prisma.promoCode.findMany({
      where: { ownerId: userId, active: true, usedCount: 0 },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <>
      <AvatarUpload name={user.name ?? "Игрок"} image={user.image} configured={r2Configured} />
      <ProfileForm
        email={user.email ?? ""}
        name={user.name ?? ""}
        phone={user.phone ?? ""}
        bio={user.playerProfile?.bio ?? ""}
        ntrpLevel={user.playerProfile?.ntrpLevel ?? null}
        weekdayAvailability={user.playerProfile?.weekdayAvailability ?? ""}
        weekendAvailability={user.playerProfile?.weekendAvailability ?? ""}
        preferredDays={user.playerProfile?.preferredDays ?? []}
        preferredDistricts={user.playerProfile?.preferredDistricts ?? []}
      />
      <TelegramSection telegramUsername={user.telegramUsername} />
      <PushNotificationToggle />
      <ReferralSection
        referralCode={referralCode}
        referralsCount={referralsCount}
        bonusCodes={bonusCodes.map((promo) => ({
          code: promo.code,
          discountValue: promo.discountValue.toNumber(),
          discountType: promo.discountType,
        }))}
      />
    </>
  )
}
