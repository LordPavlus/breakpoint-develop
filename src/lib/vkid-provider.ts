import type { OAuthConfig } from "next-auth/providers"

interface VKIDProfile {
  user: {
    user_id: number
    first_name: string
    last_name: string
    email?: string
    avatar?: string
  }
}

// Кастомный провайдер для нового VK ID (id.vk.com/oauth2),
// т.к. встроенный next-auth/providers/vk использует устаревший oauth.vk.com
export function VKIDProvider({
  clientId,
  clientSecret,
}: {
  clientId: string
  clientSecret: string
}): OAuthConfig<VKIDProfile> {
  return {
    id: "vk",
    name: "VK ID",
    type: "oauth",
    authorization: {
      url: "https://id.vk.com/oauth2/auth",
      params: { scope: "email", response_type: "code" },
    },
    token: "https://id.vk.com/oauth2/token",
    userinfo: {
      url: "https://id.vk.com/oauth2/user_info",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async request({ tokens, provider }: any) {
        const res = await fetch(provider.userinfo.url as string, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            access_token: tokens.access_token as string,
          }),
        })
        return res.json()
      },
    },
    profile(profile) {
      return {
        id: String(profile.user.user_id),
        name:
          [profile.user.first_name, profile.user.last_name].filter(Boolean).join(" ") || null,
        email: profile.user.email ?? null,
        image: profile.user.avatar ?? null,
        role: "PLAYER" as const,
      }
    },
    clientId,
    clientSecret,
    allowDangerousEmailAccountLinking: true,
  }
}
