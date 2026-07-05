"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { promoDiscountTypeLabels, promoScopeLabels } from "@/lib/promo"
import {
  createPromoCode,
  type CreatePromoCodeState,
} from "@/server/actions/promo-codes"

const initialState: CreatePromoCodeState = {}

export function PromoCodeForm() {
  const [state, formAction, pending] = useActionState(createPromoCode, initialState)

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="code">Код</Label>
          <Input
            id="code"
            name="code"
            placeholder="BREAKPOINT10"
            className="uppercase placeholder:normal-case"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="discountValue">Размер скидки</Label>
          <Input id="discountValue" name="discountValue" type="number" min={0} step="0.01" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="discountType">Тип скидки</Label>
          <Select name="discountType" defaultValue="PERCENT">
            <SelectTrigger id="discountType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(promoDiscountTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scope">Область действия</Label>
          <Select name="scope" defaultValue="ALL">
            <SelectTrigger id="scope" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(promoScopeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="maxUses">Лимит использований</Label>
          <Input
            id="maxUses"
            name="maxUses"
            type="number"
            min={1}
            step="1"
            placeholder="Без ограничения"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiresAt">Действует до</Label>
          <Input id="expiresAt" name="expiresAt" type="date" />
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">Промокод создан.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Создаём…" : "Создать промокод"}
      </Button>
    </form>
  )
}
