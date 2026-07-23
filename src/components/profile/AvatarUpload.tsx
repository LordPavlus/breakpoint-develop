"use client"

import { useRef, useState, useTransition } from "react"
import { Camera, Loader2, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { removeAvatar, requestAvatarUploadUrl, saveAvatarUrl } from "@/server/actions/avatar"

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

    startTransition(async () => {
      try {
        const uploadTarget = await requestAvatarUploadUrl(file.type)
        if ("error" in uploadTarget) {
          setError(uploadTarget.error)
          return
        }

        const response = await fetch(uploadTarget.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        })
        if (!response.ok) {
          setError("Не удалось загрузить файл. Попробуйте другое фото или повторите позже.")
          return
        }

        const result = await saveAvatarUrl(uploadTarget.publicUrl)
        if (result.error) {
          setError(result.error)
          return
        }

        setPreview(uploadTarget.publicUrl)
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
    </div>
  )
}
