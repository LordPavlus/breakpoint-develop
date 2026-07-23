import { PutObjectCommand } from "@aws-sdk/client-s3"

import { r2Client, r2Configured } from "@/lib/storage/s3"

const AVATAR_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export type AvatarUploadResult = { publicUrl: string }

// Загружает фото профиля в R2 напрямую с сервера (Server Action получает
// файл от клиента как обычный same-origin запрос — CORS не участвует,
// в отличие от прежнего варианта с presigned PUT прямо из браузера в R2).
// Ключ включает userId и timestamp, чтобы старые фото не перетирались гонкой
// загрузок и URL менялся при каждой замене (инвалидация кэша/CDN).
export async function uploadAvatarFile(
  userId: string,
  contentType: string,
  body: Buffer
): Promise<AvatarUploadResult | { error: string }> {
  if (!r2Configured || !r2Client) {
    return { error: "Загрузка фото временно недоступна" }
  }

  const ext = AVATAR_CONTENT_TYPES[contentType]
  if (!ext) {
    return { error: "Поддерживаются только JPEG, PNG и WebP" }
  }

  const key = `avatars/${userId}-${Date.now()}.${ext}`

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
