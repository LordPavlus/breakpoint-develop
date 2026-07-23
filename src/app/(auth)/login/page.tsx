import Link from "next/link"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { YandexLoginButton } from "@/components/auth/OAuthButtons"
import { LoginForm } from "./LoginForm"

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

          <YandexLoginButton />
        </CardContent>
      </Card>

      <Link
        href="/become-coach"
        className="mt-4 text-center text-sm text-primary underline-offset-4 hover:underline"
      >
        Хотите тренировать? Подать заявку тренера
      </Link>
    </div>
  )
}
