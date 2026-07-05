"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const tabs = [
  { href: "/coach", label: "Дашборд" },
  { href: "/coach/slots", label: "Слоты" },
  { href: "/coach/bookings", label: "Бронирования" },
  { href: "/coach/payouts", label: "Выплаты" },
  { href: "/coach/profile", label: "Профиль" },
]

export function CoachTabs() {
  const pathname = usePathname()

  return (
    <nav className="mt-6 flex gap-4 border-b border-border">
      {tabs.map((tab) => {
        const active =
          tab.href === "/coach"
            ? pathname === tab.href
            : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
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
