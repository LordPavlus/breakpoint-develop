"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { signIn, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { widgetUserToAuthData, type TelegramWidgetUser } from "@/lib/telegram"
import {
  generateOtpCode,
  hashOtpCode,
  getOtpExpiry,
  OTP_TTL_MS,
  OTP_RESEND_INTERVAL_MS,
} from "@/lib/otp"
import { sendOtpEmail } from "@/lib/email/send-otp"

const emailSchema = z.email({ error: "Введите корректный email" })

export type RequestOtpState = {
  error?: string
}

export async function requestOtp(
  _prevState: RequestOtpState,
  formData: FormData
): Promise<RequestOtpState> {
  const parsed = emailSchema.safeParse(formData.get("email"))

  if (!parsed.success) {
    return { error: "Введите корректный email" }
  }

  const email = parsed.data.toLowerCase().trim()

  const lastToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    orderBy: { expires: "desc" },
  })

  if (lastToken) {
    const issuedAt = lastToken.expires.getTime() - OTP_TTL_MS
    if (Date.now() - issuedAt < OTP_RESEND_INTERVAL_MS) {
      return { error: "Код уже отправлен. Попробуйте через минуту." }
    }
  }

  const code = generateOtpCode()

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: { identifier: email, token: hashOtpCode(email, code), expires: getOtpExpiry() },
    }),
  ])

  await sendOtpEmail(email, code)

  redirect(`/verify?email=${encodeURIComponent(email)}`)
}

export type VerifyOtpState = {
  error?: string
}

export async function verifyOtp(
  _prevState: VerifyOtpState,
  formData: FormData
): Promise<VerifyOtpState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim()
  const code = String(formData.get("code") ?? "").trim()

  if (!email || !/^\d{6}$/.test(code)) {
    return { error: "Введите 6-значный код" }
  }

  try {
    await signIn("email-otp", { email, code, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Неверный или истёкший код" }
    }
    throw error
  }

  redirect("/")
}

export type SignInWithTelegramState = {
  error?: string
}

export async function signInWithTelegram(
  data: TelegramWidgetUser
): Promise<SignInWithTelegramState> {
  const authData = widgetUserToAuthData(data)

  const credentials: Record<string, string> = {
    id: authData.id,
    first_name: authData.first_name,
    auth_date: authData.auth_date,
    hash: authData.hash,
  }
  if (authData.last_name) credentials.last_name = authData.last_name
  if (authData.username) credentials.username = authData.username
  if (authData.photo_url) credentials.photo_url = authData.photo_url

  try {
    await signIn("telegram", { ...credentials, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Не удалось войти через Telegram" }
    }
    throw error
  }

  redirect("/")
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" })
}
