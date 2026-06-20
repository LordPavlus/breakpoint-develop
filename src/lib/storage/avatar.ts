import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { r2Client, r2Configured } from "@/lib/storage/s3"

const AVATAR_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export type AvatarUploadUrl = { uploadUrl: string; publicUrl: string }

// Готовит presigned PUT URL для прямой загрузки фото профиля с клиента в R2
// (мимо Server Action — большие файлы не должны идти через серверный body).
// Ключ включает userId и timestamp, чтобы старые фото не перетирались гонкой
// загрузок и URL менялся при каждой замене (инвалидация кэша/CDN).
export async function createAvatarUploadUrl(
  userId: string,
  contentType: string
): Promise<AvatarUploadUrl | { error: string }> {
  if (!r2Configured || !r2Client) {
    return { error: "Загрузка фото временно недоступна" }
  }

  const ext = AVATAR_CONTENT_TYPES[contentType]
  if (!ext) {
    return { error: "Поддерживаются только JPEG, PNG и WebP" }
  }

  const key = `avatars/${userId}-${Date.now()}.${ext}`

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
