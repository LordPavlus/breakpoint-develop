import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TournamentsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Турниры
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Турниры по уровню NTRP с групповым этапом и сеткой плей-офф.
          Регистрация и оплата взноса — через ЮKassa.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="mb-2 size-10 rounded-lg" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-1 h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
