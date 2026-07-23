"use client"

import { useRef, useState, useTransition } from "react"
import { Camera, Loader2, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { removeAvatar, uploadAvatar } from "@/server/actions/avatar"
import { AvatarCropDialog } from "@/components/profile/AvatarCropDialog"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024
const MAX_SIZE_LABEL = "5 МБ"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
}

export function AvatarUpload({
  name,
  image,
  configured,
}: {
  name: string
  image: string | null
  configured: boolean
}) {
  const [preview, setPreview] = useState(image)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [cropTarget, setCropTarget] = useState<{ src: string; contentType: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!configured) return null

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

    setCropTarget({ src: URL.createObjectURL(file), contentType: file.type })
  }

  const closeCropDialog = () => {
    if (cropTarget) URL.revokeObjectURL(cropTarget.src)
    setCropTarget(null)
  }

  const handleCropped = (blob: Blob) => {
    const contentType = cropTarget?.contentType ?? "image/jpeg"
    closeCropDialog()

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set("file", blob, `avatar.${contentType === "image/png" ? "png" : "jpg"}`)
        const result = await uploadAvatar(formData)
        if (result.error || !result.url) {
          setError(result.error ?? "Не удалось загрузить файл")
          return
        }

        setPreview(result.url)
      } catch {
        setError(
          "Не удалось загрузить файл — проверьте соединение с интернетом и попробуйте ещё раз."
        )
      }
    })
  }

  const handleRemove = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await removeAvatar()
        if (result.error) {
          setError(result.error)
          return
        }
        setPreview(null)
      } catch {
        setError("Не удалось удалить фото. Попробуйте ещё раз.")
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar size="lg">
        {preview && <AvatarImage src={preview} alt={name} />}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
            {preview ? "Изменить фото" : "Загрузить фото"}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={handleRemove}
            >
              <X className="size-4" />
              Удалить
            </Button>
          )}
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
      {cropTarget && (
        <AvatarCropDialog
          imageSrc={cropTarget.src}
          contentType={cropTarget.contentType}
          onCancel={closeCropDialog}
          onCropped={handleCropped}
        />
      )}
    </div>
  )
}
