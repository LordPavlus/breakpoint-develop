"use client"

import { signIn } from "next-auth/react"

export function YandexLoginButton() {
  return (
    <button
      onClick={() => signIn("yandex", { callbackUrl: "/" })}
      className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
      style={{ backgroundColor: "#FC3F1D" }}
    >
      {/* Официальный логотип Яндекс ID */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13.706 21H11.14V13.32H9.27L5.47 21H2.64L6.73 12.9C5.06 12.18 4.03 10.65 4.03 8.58C4.03 5.52 6.07 3.75 9.57 3.75H13.706V21ZM11.14 11.16V5.91H9.48C7.44 5.91 6.41 6.96 6.41 8.58C6.41 10.26 7.44 11.16 9.33 11.16H11.14Z"
          fill="white"
        />
        <path
          d="M17.5 3.75H15.5V21H17.5V3.75Z"
          fill="white"
        />
      </svg>
      Войти с Яндекс ID
    </button>
  )
}
