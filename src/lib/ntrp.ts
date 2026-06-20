import { NtrpLevel } from "@prisma/client"

export const ntrpLabels: Record<NtrpLevel, string> = {
  NTRP_1_0: "1.0",
  NTRP_1_5: "1.5",
  NTRP_2_0: "2.0",
  NTRP_2_5: "2.5",
  NTRP_3_0: "3.0",
  NTRP_3_5: "3.5",
  NTRP_4_0: "4.0",
  NTRP_4_5: "4.5",
  NTRP_5_0: "5.0",
  NTRP_5_5: "5.5",
  NTRP_6_0_PLUS: "6.0+",
}

const ntrpOrder = Object.values(NtrpLevel)

// Числовой ранг уровня для сортировки/балансировки по NTRP (выше = сильнее).
// Неизвестный уровень (null) считается самым слабым.
export function ntrpRank(level: NtrpLevel | null): number {
  if (!level) return -1
  return ntrpOrder.indexOf(level)
}
