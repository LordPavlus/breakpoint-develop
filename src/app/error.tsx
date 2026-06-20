"use client"

import { useEffect } from "react"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <TriangleAlert className="size-6" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Что-то пошло не так
      </h1>
      <p className="mt-2 text-muted-foreground">
        Произошла непредвиденная ошибка. Попробуйте ещё раз — если проблема
        повторится, загляните позже.
      </p>
      <Button className="mt-6" onClick={() => unstable_retry()}>
        Попробовать снова
      </Button>
    </div>
  )
}
