import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VerifyForm } from "./VerifyForm"

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; role?: string }>
}) {
  const { email, role } = await searchParams

  if (!email) {
    redirect("/login")
  }

  const registerAsCoach = role === "coach"

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16 sm:py-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Введите код</CardTitle>
          <CardDescription>
            Мы отправили 6-значный код на {email}. Он действителен 10 минут.
            {registerAsCoach && " Аккаунт будет зарегистрирован как тренер."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyForm email={email} role={registerAsCoach ? "coach" : undefined} />
        </CardContent>
      </Card>
    </div>
  )
}
