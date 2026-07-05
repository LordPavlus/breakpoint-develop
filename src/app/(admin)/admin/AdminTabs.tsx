"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const tabs = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/settings", label: "Настройки" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/payments", label: "Платежи" },
  { href: "/admin/payouts", label: "Выплаты" },
  { href: "/admin/tournaments", label: "Турниры" },
  { href: "/admin/trainings", label: "Тренировки" },
  { href: "/admin/promo-codes", label: "Промокоды" },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <nav className="mt-6 flex gap-4 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === tab.href
            : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
