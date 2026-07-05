import { Skeleton } from "@/components/ui/skeleton"

export default function TournamentDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Skeleton className="size-12 rounded-lg" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-2/3" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-28" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="ml-auto h-7 w-16" />
          </div>
        </div>

        <Skeleton className="h-10 w-full rounded-md sm:w-48" />
      </div>
    </div>
  )
}
