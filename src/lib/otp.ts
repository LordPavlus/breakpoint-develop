import { createHmac, randomInt } from "crypto"

export const OTP_LENGTH = 6
export const OTP_TTL_MS = 10 * 60 * 1000
export const OTP_RESEND_INTERVAL_MS = 90 * 1000

export function generateOtpCode(): string {
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0")
}

// AUTH_SECRET как HMAC-ключ — без него хэш кода не восстановить даже при утечке VerificationToken
export function hashOtpCode(email: string, code: string): string {
  const secret = process.env.AUTH_SECRET ?? ""
  return createHmac("sha256", secret)
    .update(`${email.toLowerCase()}:${code}`)
    .digest("hex")
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS)
}
