import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Yandex from "next-auth/providers/yandex"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { VKIDProvider } from "@/lib/vkid-provider"
import type { UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { hashOtpCode } from "@/lib/otp"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Yandex({
      clientId: process.env.YANDEX_CLIENT_ID!,
      clientSecret: process.env.YANDEX_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    VKIDProvider({
      clientId: process.env.VK_CLIENT_ID!,
      clientSecret: process.env.VK_CLIENT_SECRET!,
    }),
    Credentials({
      id: "vkid-token",
      name: "VK ID Token",
      credentials: { token: {} },
      async authorize(credentials) {
        const token = String(credentials?.token ?? "")
        if (!token) return null

        // Валидируем токен через VK ID и получаем данные пользователя
        const res = await fetch("https://id.vk.com/oauth2/user_info", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.VK_CLIENT_ID!,
            access_token: token,
          }),
        })
        const data = await res.json()
        const vkUser = data?.user
        if (!vkUser?.user_id) return null

        const vkId = String(vkUser.user_id)
        const name =
          [vkUser.first_name, vkUser.last_name].filter(Boolean).join(" ") || null
        const email: string | null = vkUser.email ?? null
        const image: string | null = vkUser.avatar ?? null

        // Ищем существующий VK-аккаунт
        const account = await prisma.account.findFirst({
          where: { provider: "vk", providerAccountId: vkId },
          include: { user: true },
        })
        if (account) {
          return {
            id: account.user.id,
            email: account.user.email,
            name: name ?? account.user.name,
            role: account.user.role,
          }
        }

        // Связываем с существующим пользователем по email
        if (email) {
          const existing = await prisma.user.findUnique({ where: { email } })
          if (existing) {
            await prisma.account.create({
              data: {
                userId: existing.id,
                provider: "vk",
                providerAccountId: vkId,
                type: "oauth",
              },
            })
            return { id: existing.id, email: existing.email, name: existing.name, role: existing.role }
          }
        }

        // Создаём нового пользователя
        const newUser = await prisma.user.create({ data: { name, email, image } })
        await prisma.account.create({
          data: {
            userId: newUser.id,
            provider: "vk",
            providerAccountId: vkId,
            type: "oauth",
          },
        })
        return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
      },
    }),
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: { email: {}, code: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim()
        const code = String(credentials?.code ?? "").trim()
        if (!email || !code) return null

        const tokenHash = hashOtpCode(email, code)
        const verificationToken = await prisma.verificationToken.findUnique({
          where: { identifier_token: { identifier: email, token: tokenHash } },
        })
        if (!verificationToken || verificationToken.expires < new Date()) return null

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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        token.role = dbUser?.role ?? ("PLAYER" as UserRole)
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
