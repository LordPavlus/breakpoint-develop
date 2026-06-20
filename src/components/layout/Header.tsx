"use client"

import Link from "next/link"
import type { Session } from "next-auth"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Logo } from "@/components/layout/Logo"
import { signOutAction } from "@/server/actions/auth"

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/trainings", label: "Тренировки" },
  { href: "/tournaments", label: "Турниры" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
}

export function Header({
  user,
  image,
}: {
  user: Session["user"] | null
  image: string | null
}) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const cabinetHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "COACH" ? "/coach" : "/account"
  const cabinetLabel =
    user?.role === "ADMIN"
      ? "Админка"
      : user?.role === "COACH"
        ? "Кабинет тренера"
        : "Личный кабинет"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive(link.href) ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href={cabinetHref}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive(cabinetHref) ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {cabinetLabel}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar size="sm">
                {image && <AvatarImage src={image} alt={user.name ?? "Профиль"} />}
                <AvatarFallback>{initials(user.name ?? user.email ?? "?")}</AvatarFallback>
              </Avatar>
              <span className="max-w-40 truncate text-sm text-muted-foreground">
                {user.name ?? user.email}
              </span>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Выйти
                </Button>
              </form>
            </div>
          ) : (
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              className="hidden sm:inline-flex"
            >
              Войти
            </Button>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="md:hidden" />
              }
            >
              <Menu />
              <span className="sr-only">Открыть меню</span>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Меню</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={<Link href={link.href} />}
                    nativeButton={false}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      isActive(link.href)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </SheetClose>
                ))}
                {user && (
                  <SheetClose
                    render={<Link href={cabinetHref} />}
                    nativeButton={false}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      isActive(cabinetHref)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {cabinetLabel}
                  </SheetClose>
                )}
              </nav>
              <div className="mt-auto space-y-2 p-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-1">
                      <Avatar size="sm">
                        {image && <AvatarImage src={image} alt={user.name ?? "Профиль"} />}
                        <AvatarFallback>{initials(user.name ?? user.email ?? "?")}</AvatarFallback>
                      </Avatar>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.name ?? user.email}
                      </p>
                    </div>
                    <form action={signOutAction}>
                      <Button type="submit" variant="outline" className="w-full">
                        Выйти
                      </Button>
                    </form>
                  </>
                ) : (
                  <SheetClose
                    render={<Link href="/login" />}
                    nativeButton={false}
                    className={cn(buttonVariants({ className: "w-full" }))}
                  >
                    Войти
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
