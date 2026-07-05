"use client"

import { useActionState } from "react"
import type { NtrpLevel } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateProfile, type UpdateProfileState } from "@/server/actions/profile"
import { ntrpLabels } from "@/lib/ntrp"

const initialState: UpdateProfileState = {}

export function ProfileForm({
  email,
  name,
  bio,
  ntrpLevel,
}: {
  email: string
  name: string
  bio: string
  ntrpLevel: NtrpLevel | null
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ntrpLevel">Уровень NTRP</Label>
        <Select name="ntrpLevel" defaultValue={ntrpLevel ?? undefined}>
          <SelectTrigger id="ntrpLevel" className="w-full">
            <SelectValue placeholder="Не указан" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ntrpLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          rows={4}
          placeholder="Немного о вашем теннисном опыте"
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-primary">Профиль сохранён.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить"}
      </Button>
    </form>
  )
}
