import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Yandex from "next-auth/providers/yandex"
import VK from "next-auth/providers/vk"
import { PrismaAdapter } from "@auth/prisma-adapter"
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
    VK({
      clientId: process.env.VK_CLIENT_ID!,
      clientSecret: process.env.VK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      checks: ["state"], // классический oauth.vk.com не поддерживает PKCE
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
