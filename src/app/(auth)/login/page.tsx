import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { signIn } from "@/lib/auth"
import { LoginForm } from "./LoginForm"

async function signInWithYandex() {
  "use server"
  await signIn("yandex", { redirectTo: "/" })
}

async function signInWithVK() {
  "use server"
  await signIn("vk", { redirectTo: "/" })
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16 sm:py-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Вход в Break Point</CardTitle>
          <CardDescription>
            Введите email — мы отправим одноразовый код для входа.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">или</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            <form action={signInWithYandex}>
              <Button type="submit" variant="outline" className="w-full">
                Войти через Яндекс ID
              </Button>
            </form>
            <form action={signInWithVK}>
              <Button type="submit" variant="outline" className="w-full">
                Войти через VK ID
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
