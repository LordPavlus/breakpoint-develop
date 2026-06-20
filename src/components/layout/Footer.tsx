import Link from "next/link"
import { MessageCircle, Send } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/layout/Logo"

const socialLinks = [
  {
    href: "https://t.me/breakpointmoscow",
    label: "Telegram",
    icon: Send,
  },
  {
    href: "https://max.ru/u/f9LHodD0cOJH5PDyQcBvPlFYrgxOCeV5DMu51qtxGFJCsPoWpeb3RRmKR_Y",
    label: "MAX",
    icon: MessageCircle,
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Платформа для теннисистов-любителей в Москве: тренировки с
              тренерами и турниры по уровню NTRP.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Платформа
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Главная
                  </Link>
                </li>
                <li>
                  <Link href="/trainings" className="hover:text-foreground">
                    Тренировки
                  </Link>
                </li>
                <li>
                  <Link href="/tournaments" className="hover:text-foreground">
                    Турниры
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Аккаунт
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    Вход
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Документы
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/legal#agreement"
                    className="hover:text-foreground"
                  >
                    Пользовательское соглашение
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal#privacy"
                    className="hover:text-foreground"
                  >
                    Политика конфиденциальности
                  </Link>
                </li>
                <li>
                  <Link href="/legal#offer" className="hover:text-foreground">
                    Публичная оферта
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal#consent"
                    className="hover:text-foreground"
                  >
                    Согласие на обработку ПД
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Break Point. Москва. ИНН 772606553272
        </p>
      </div>
    </footer>
  )
}
