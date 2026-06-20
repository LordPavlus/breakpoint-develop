const YOOKASSA_API_URL = "https://api.yookassa.ru/v3"

export const yookassaConfigured = Boolean(
  process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY
)

type RequestOptions = {
  method?: "GET" | "POST"
  body?: unknown
  idempotenceKey?: string
}

export async function yookassaRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY

  if (!shopId || !secretKey) {
    throw new Error(
      "ЮKassa не настроена: отсутствуют YOOKASSA_SHOP_ID/YOOKASSA_SECRET_KEY"
    )
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`,
  }

  if (options.idempotenceKey) {
    headers["Idempotence-Key"] = options.idempotenceKey
  }

  const response = await fetch(`${YOOKASSA_API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`ЮKassa API ${path} -> ${response.status}: ${text}`)
  }

  return response.json() as Promise<T>
}
