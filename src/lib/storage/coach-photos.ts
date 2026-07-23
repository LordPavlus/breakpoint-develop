import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { r2Client, r2Configured } from "@/lib/storage/s3"

const PHOTO_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export type CoachPhotoUploadUrl = { uploadUrl: string; publicUrl: string }

// Аналог createAvatarUploadUrl (см. lib/storage/avatar.ts) — presigned PUT
// для галереи фото с тренировок на публичном профиле тренера.
export async function createCoachPhotoUploadUrl(
  coachId: string,
  contentType: string
): Promise<CoachPhotoUploadUrl | { error: string }> {
  if (!r2Configured || !r2Client) {
    return { error: "Загрузка фото временно недоступна" }
  }

  const ext = PHOTO_CONTENT_TYPES[contentType]
  if (!ext) {
    return { error: "Поддерживаются только JPEG, PNG и WebP" }
  }

  const key = `coach-photos/${coachId}-${Date.now()}.${ext}`

  const uploadUrl = await getSignedUrl(
    r2Client,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 }
  )

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

  return { uploadUrl, publicUrl }
}
