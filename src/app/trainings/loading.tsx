import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TrainingsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Тренировки
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Свободные слоты у тренеров — выберите удобное время, корт и
          записывайтесь.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
