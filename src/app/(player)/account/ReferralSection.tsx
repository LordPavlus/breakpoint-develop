"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { REFERRAL_DISCOUNT_PERCENT, REFERRAL_REWARD_PERCENT } from "@/lib/promo"

export type BonusCode = {
  code: string
  discountValue: number
  discountType: "PERCENT" | "FIXED"
}

export function ReferralSection({
  referralCode,
  referralsCount,
  bonusCodes,
}: {
  referralCode: string
  referralsCount: number
  bonusCodes: BonusCode[]
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Реферальная программа</CardTitle>
        <CardDescription>
          Поделитесь кодом с другом — при первой оплате тренировки или турнира
          он вводит его в поле «Промокод» и получает скидку{" "}
          {REFERRAL_DISCOUNT_PERCENT}%. А вы получаете бонусный промокод на
          скидку {REFERRAL_REWARD_PERCENT}%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Ваш код</span>
          <div className="flex gap-2">
            <Input readOnly value={referralCode} className="font-mono uppercase" />
            <Button variant="outline" onClick={handleCopy}>
              {copied ? "Скопировано" : "Копировать"}
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Приглашено друзей:{" "}
          <span className="font-medium text-foreground">{referralsCount}</span>
        </p>

        {bonusCodes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground">
              Ваши бонусные промокоды (примените при следующей оплате)
            </span>
            <div className="flex flex-wrap gap-2">
              {bonusCodes.map((bonus) => (
                <Badge key={bonus.code} variant="secondary" className="font-mono">
                  {bonus.code} (−{bonus.discountValue}
                  {bonus.discountType === "PERCENT" ? "%" : " ₽"})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
