import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile(".env");
} catch {
  // .env отсутствует — переменные окружения берутся из окружения процесса (CI/прод)
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  // DIRECT_URL нужен только для prisma migrate/db push/studio (локально).
  // На Vercel при prisma generate (в build-шаге) env-переменная уже есть,
  // но при postinstall — ещё нет, поэтому делаем секцию условной.
  ...(process.env.DIRECT_URL
    ? { datasource: { url: env("DIRECT_URL") } }
    : {}),
});
