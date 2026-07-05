import { randomBytes } from "crypto"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

type Tx = Prisma.TransactionClient

// Без визуально похожих символов (0/O, 1/I/L), чтобы код легко передать голосом/вручную
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateCode(length: number): string {
  const bytes = randomBytes(length)
  let result = ""
  for (let i = 0; i < length; i++) {
    result += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return result
}

// Лениво генерирует и сохраняет реферальный код пользователя при первом обращении
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  if (user.referralCode) return user.referralCode

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode(8)
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } })
      return code
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        continue
      }
      throw err
    }
  }

  throw new Error("Не удалось сгенерировать реферальный код")
}

// Бонусный промокод, который получает пригласивший — отличается префиксом от
// обычных кодов, чтобы быть узнаваемым в админке и в личном кабинете
export async function generateUniqueRewardCode(tx: Tx): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `BONUS-${generateCode(6)}`
    const existing = await tx.promoCode.findUnique({ where: { code } })
    if (!existing) return code
  }

  throw new Error("Не удалось сгенерировать промокод")
}
