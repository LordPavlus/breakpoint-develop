import { redirect } from "next/navigation"
import Link from "next/link"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AvatarUpload } from "@/components/profile/AvatarUpload"
import { r2Configured } from "@/lib/storage/s3"
import { CoachProfileForm } from "./CoachProfileForm"
import { CoachPhotoGallery } from "./CoachPhotoGallery"

export default async function CoachProfilePage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const coach = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId },
    include: { user: true, photos: { orderBy: { createdAt: "desc" } } },
  })

  return (
    <>
      <Link
        href={`/coaches/${coach.id}`}
        className="block text-sm text-primary underline-offset-4 hover:underline"
      >
        Смотреть публичный профиль →
      </Link>
      <AvatarUpload
        name={coach.user.name ?? "Тренер"}
        image={coach.user.image}
        configured={r2Configured}
      />
      <CoachProfileForm
        email={coach.user.email ?? ""}
        name={coach.user.name ?? ""}
        bio={coach.bio ?? ""}
        achievements={coach.achievements ?? ""}
        specialization={coach.specialization.join(", ")}
        payoutInfo={coach.payoutInfo ?? ""}
      />
      {r2Configured && (
        <CoachPhotoGallery photos={coach.photos.map((p) => ({ id: p.id, url: p.url }))} />
      )}
    </>
  )
}
