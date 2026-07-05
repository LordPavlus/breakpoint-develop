import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AvatarUpload } from "@/components/profile/AvatarUpload"
import { r2Configured } from "@/lib/storage/s3"
import { CoachProfileForm } from "./CoachProfileForm"

export default async function CoachProfilePage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const coach = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId },
    include: { user: true },
  })

  return (
    <>
      <AvatarUpload
        name={coach.user.name ?? "Тренер"}
        image={coach.user.image}
        configured={r2Configured}
      />
      <CoachProfileForm
        email={coach.user.email ?? ""}
        name={coach.user.name ?? ""}
        bio={coach.bio ?? ""}
        specialization={coach.specialization.join(", ")}
        payoutInfo={coach.payoutInfo ?? ""}
      />
    </>
  )
}
