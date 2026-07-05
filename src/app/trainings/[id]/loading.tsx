import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TrainingSlotLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Skeleton className="mb-6 h-4 w-32" />

      {/* Coach info skeleton */}
      <div className="mb-8 flex flex-wrap items-start gap-5">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      <Separator className="mb-8" />

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex gap-3">
              <Skeleton className="mt-0.5 size-5 shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="mt-0.5 size-5 shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="mt-0.5 size-5 shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between gap-4 pt-6">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
