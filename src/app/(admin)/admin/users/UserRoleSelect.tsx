"use client"

import { useActionState, useRef } from "react"
import type { UserRole } from "@prisma/client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUserRole, type UpdateUserRoleState } from "@/server/actions/users"

const roleLabels: Record<UserRole, string> = {
  PLAYER: "Игрок",
  COACH: "Тренер",
  ADMIN: "Админ",
}

const initialState: UpdateUserRoleState = {}

export function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string
  role: UserRole
  disabled?: boolean
}) {
  const [state, formAction] = useActionState(updateUserRole, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form action={formAction} ref={formRef} className="space-y-1">
      <input type="hidden" name="userId" value={userId} />
      <Select
        name="role"
        defaultValue={role}
        disabled={disabled}
        onValueChange={() => formRef.current?.requestSubmit()}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roleLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  )
}
