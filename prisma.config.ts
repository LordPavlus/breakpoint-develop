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
  datasource: {
    // Прямое (unpooled) подключение — нужно Prisma Migrate/db push/studio для
    // advisory locks и работы с shadow database. Рантайм-клиент (src/lib/prisma.ts)
    // использует отдельный driver adapter с DATABASE_URL (pooled).
    url: env("DIRECT_URL"),
  },
});
