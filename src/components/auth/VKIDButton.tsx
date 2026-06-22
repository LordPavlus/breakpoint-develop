"use client"

import { useEffect, useRef } from "react"
import { signIn } from "next-auth/react"

// Типы VK ID SDK
interface VKIDSDKType {
  Config: {
    init: (config: {
      app: number
      redirectUrl: string
      responseMode: string
      source: string
      scope: string
    }) => void
  }
  ConfigResponseMode: { Callback: string; Redirect: string }
  ConfigSource: { LOWCODE: string }
  OneTap: new () => {
    render: (options: {
      container: HTMLElement | null
      showAlternativeLogin: boolean
    }) => { on: (event: string, handler: (...args: unknown[]) => void) => unknown }
  }
  WidgetEvents: { ERROR: string }
  OneTapInternalEvents: { LOGIN_SUCCESS: string }
  Auth: {
    exchangeCode: (
      code: string,
      deviceId: string
    ) => Promise<{ access_token: string }>
  }
}

declare global {
  interface Window {
    VKIDSDK?: VKIDSDKType
  }
}

export function VKIDButton() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const appId = Number(process.env.NEXT_PUBLIC_VK_CLIENT_ID)
    if (!appId) return

    const script = document.createElement("script")
    script.src = "https://unpkg.com/@vkid/sdk@3.0.0/dist-sdk/umd/index.js"
    script.async = true
    script.onload = () => {
      const VKID = window.VKIDSDK
      if (!VKID || !containerRef.current) return

      VKID.Config.init({
        app: appId,
        redirectUrl: `${window.location.origin}/api/auth/callback/vk`,
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
        scope: "vkid.personal_info email",
      })

      const oneTap = new VKID.OneTap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(oneTap as any)
        .render({ container: containerRef.current, showAlternativeLogin: true })
        .on(VKID.WidgetEvents.ERROR, (error: unknown) => {
          console.error("VK ID error:", error)
        })
        .on(
          VKID.OneTapInternalEvents.LOGIN_SUCCESS,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          async (payload: any) => {
            const { code, device_id } = payload as {
              code: string
              device_id: string
            }
            try {
              const data = await VKID.Auth.exchangeCode(code, device_id)
              await signIn("vkid-token", {
                token: data.access_token,
                callbackUrl: "/",
              })
            } catch (err) {
              console.error("VK auth error:", err)
            }
          }
        )
    }
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  return <div ref={containerRef} />
}
