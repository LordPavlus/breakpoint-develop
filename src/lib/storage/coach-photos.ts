import { PutObjectCommand } from "@aws-sdk/client-s3"

import { r2Client, r2Configured } from "@/lib/storage/s3"

const PHOTO_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export type CoachPhotoUploadResult = { publicUrl: string }

// Аналог uploadAvatarFile (см. lib/storage/avatar.ts) — загрузка с сервера,
// без presigned PUT из браузера и без зависимости от CORS-настроек R2.
export async function uploadCoachPhotoFile(
  coachId: string,
  contentType: string,
  body: Buffer
): Promise<CoachPhotoUploadResult | { error: string }> {
  if (!r2Configured || !r2Client) {
    return { error: "Загрузка фото временно недоступна" }
  }

  const ext = PHOTO_CONTENT_TYPES[contentType]
  if (!ext) {
    return { error: "Поддерживаются только JPEG, PNG и WebP" }
  }

  const key = `coach-photos/${coachId}-${Date.now()}.${ext}`

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Body: body,
    })
  )

  return { publicUrl: `${process.env.R2_PUBLIC_URL}/${key}` }
}
