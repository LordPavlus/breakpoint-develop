import Link from "next/link"

import { cn } from "@/lib/utils"

const DAYS_AHEAD = 14

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "short" })
const dayFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" })

// YYYY-MM-DD в локальном времени сервера (без UTC-сдвига toISOString)
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DateFilter({ selected }: { selected?: string }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    return date
  })

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      <Link
        href="/trainings"
        className={cn(
          "shrink-0 rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-border transition-colors",
          !selected
            ? "bg-primary text-primary-foreground ring-primary"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        Все дни
      </Link>
      {days.map((date) => {
        const key = toDateKey(date)
        const active = key === selected
        return (
          <Link
            key={key}
            href={`/trainings?date=${key}`}
            className={cn(
              "flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 text-center text-xs font-medium ring-1 ring-border transition-colors",
              active
                ? "bg-primary text-primary-foreground ring-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="capitalize">{weekdayFormatter.format(date)}</span>
            <span className="text-sm">{dayFormatter.format(date)}</span>
          </Link>
        )
      })}
    </div>
  )
}
