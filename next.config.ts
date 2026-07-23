import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // По умолчанию лимит тела Server Action — 1MB; фото профиля/галереи до 5MB
  // теперь грузятся через Server Action (см. avatar.ts/coach-photos.ts), не
  // напрямую в R2 из браузера — нужен запас на multipart-обёртку.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
