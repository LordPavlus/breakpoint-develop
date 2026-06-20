import Link from "next/link"
import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-6" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Страница не найдена
      </h1>
      <p className="mt-2 text-muted-foreground">
        Возможно, она была удалена или адрес введён неверно. Проверьте ссылку
        или вернитесь на главную.
      </p>
      <Button className="mt-6" render={<Link href="/" />} nativeButton={false}>
        На главную
      </Button>
    </div>
  )
}
