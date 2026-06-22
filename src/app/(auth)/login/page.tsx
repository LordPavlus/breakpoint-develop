import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { YandexLoginButton, VKLoginButton } from "@/components/auth/OAuthButtons"
import { VKIDButton } from "@/components/auth/VKIDButton"
import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  const hasVKID = Boolean(process.env.NEXT_PUBLIC_VK_CLIENT_ID)

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

          <div className="space-y-3">
            <YandexLoginButton />
            {/* SDK-виджет OneTap (показывается поверх кнопки когда загружается) */}
            {hasVKID && <VKIDButton />}
            {/* Запасная кнопка — всегда видна */}
            <VKLoginButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
