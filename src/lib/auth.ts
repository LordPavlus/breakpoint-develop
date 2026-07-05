import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { hashOtpCode } from "@/lib/otp"
import { verifyTelegramAuth, type TelegramAuthData } from "@/lib/telegram"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: {},
        code: {},
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim()
        const code = String(credentials?.code ?? "").trim()

        if (!email || !code) return null

        const tokenHash = hashOtpCode(email, code)

        const verificationToken = await prisma.verificationToken.findUnique({
          where: { identifier_token: { identifier: email, token: tokenHash } },
        })

        if (!verificationToken || verificationToken.expires < new Date()) {
          return null
        }

        await prisma.verificationToken.delete({
          where: { identifier_token: { identifier: email, token: tokenHash } },
        })

        const user = await prisma.user.upsert({
          where: { email },
          update: { emailVerified: new Date() },
          create: { email, emailVerified: new Date() },
        })

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
    Credentials({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: {},
        first_name: {},
        last_name: {},
        username: {},
        photo_url: {},
        auth_date: {},
        hash: {},
      },
      async authorize(credentials) {
        const data: TelegramAuthData = {
          id: String(credentials?.id ?? ""),
          first_name: String(credentials?.first_name ?? ""),
          last_name: credentials?.last_name ? String(credentials.last_name) : undefined,
          username: credentials?.username ? String(credentials.username) : undefined,
          photo_url: credentials?.photo_url ? String(credentials.photo_url) : undefined,
          auth_date: String(credentials?.auth_date ?? ""),
          hash: String(credentials?.hash ?? ""),
        }

        if (!data.id || !verifyTelegramAuth(data)) {
          return null
        }

        const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ")

        const user = await prisma.user.upsert({
          where: { telegramId: data.id },
          update: { telegramUsername: data.username ?? null },
          create: {
            telegramId: data.id,
            telegramUsername: data.username ?? null,
            name: fullName || null,
            image: data.photo_url ?? null,
          },
        })

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
})
