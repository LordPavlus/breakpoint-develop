"use client"

import { useRef, useState, useTransition } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"

import { uploadCoachPhoto, removeCoachPhoto } from "@/server/actions/coach-photos"
import { PhotoLightboxItem } from "@/components/profile/PhotoLightboxItem"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024
const MAX_SIZE_LABEL = "5 МБ"

export type CoachPhotoItem = { id: string; url: string }

export function CoachPhotoGallery({ photos: initialPhotos }: { photos: CoachPhotoItem[] }) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Поддерживаются только JPEG, PNG и WebP")
      return
    }
    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      setError(
        `Изображение слишком большое (${sizeMb} МБ) — максимум ${MAX_SIZE_LABEL}. ` +
          `Сожмите фото или уменьшите разрешение перед загрузкой.`
      )
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set("file", file)
        const result = await uploadCoachPhoto(formData)
        if (result.error || !result.id || !result.url) {
          setError(result.error ?? "Не удалось сохранить фото")
          return
        }

        setPhotos((prev) => [...prev, { id: result.id!, url: result.url! }])
      } catch {
        setError(
          "Не удалось загрузить файл — проверьте соединение с интернетом и попробуйте ещё раз."
        )
      }
    })
  }

  const handleRemove = (photoId: string) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await removeCoachPhoto(photoId)
        if (result.error) {
          setError(result.error)
          return
        }
        setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      } catch {
        setError("Не удалось удалить фото. Попробуйте ещё раз.")
      }
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Фото с тренировок</p>
        <p className="text-xs text-muted-foreground">
          Покажутся в галерее на публичной странице профиля
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
            <PhotoLightboxItem url={photo.url} className="size-full" />
            <button
              type="button"
              onClick={() => handleRemove(photo.id)}
              disabled={pending}
              className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
              <span className="sr-only">Удалить</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          {pending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
