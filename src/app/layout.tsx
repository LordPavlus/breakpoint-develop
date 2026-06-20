import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Break Point — теннис для любителей в Москве",
  description:
    "Бронируйте тренировки с тренерами и участвуйте в турнирах по теннису в Москве. Подбор по уровню NTRP, удобная оплата онлайн.",
  appleWebApp: {
    title: "Break Point",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id;
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { image: true } })
    : null;

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header user={session?.user ?? null} image={user?.image ?? null} />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
