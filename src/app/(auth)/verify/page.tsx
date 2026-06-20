import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VerifyForm } from "./VerifyForm"

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  if (!email) {
    redirect("/login")
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16 sm:py-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Введите код</CardTitle>
          <CardDescription>
            Мы отправили 6-значный код на {email}. Он действителен 10 минут.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyForm email={email} />
        </CardContent>
      </Card>
    </div>
  )
}
