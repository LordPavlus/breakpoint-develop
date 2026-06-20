import Link from "next/link"
import { CircleDot } from "lucide-react"

import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-heading text-lg font-semibold text-foreground",
        className
      )}
    >
      <CircleDot className="size-6 text-primary" strokeWidth={2.5} />
      <span>
        Break <span className="text-primary">Point</span>
      </span>
    </Link>
  )
}
