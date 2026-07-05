import crypto from "crypto"

// Данные, передаваемые Telegram Login Widget (https://core.telegram.org/widgets/login)
export type TelegramAuthData = {
  id: string
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: string
  hash: string
}

// Данные, которые Telegram Login Widget передаёт в data-onauth callback
export type TelegramWidgetUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export function widgetUserToAuthData(user: TelegramWidgetUser): TelegramAuthData {
  return {
    id: String(user.id),
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    photo_url: user.photo_url,
    auth_date: String(user.auth_date),
    hash: user.hash,
  }
}

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60

// Проверяет подпись данных от Telegram Login Widget по алгоритму из документации:
// data_check_string — отсортированные по ключу "key=value" (кроме hash), через "\n";
// secret_key = SHA256(bot_token); hash = HMAC-SHA256(data_check_string, secret_key).
export function verifyTelegramAuth(data: TelegramAuthData): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  const { hash, ...fields } = data
  if (!hash) return false

  const checkString = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  const secretKey = crypto.createHash("sha256").update(botToken).digest()
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex")

  const computedBuf = Buffer.from(computedHash)
  const hashBuf = Buffer.from(hash)
  if (computedBuf.length !== hashBuf.length) return false
  if (!crypto.timingSafeEqual(computedBuf, hashBuf)) return false

  const authDate = Number(data.auth_date)
  if (!Number.isFinite(authDate)) return false
  if (Date.now() / 1000 - authDate > MAX_AUTH_AGE_SECONDS) return false

  return true
}
