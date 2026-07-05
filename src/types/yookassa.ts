// Минимальные типы ЮKassa REST API v3, используемые platform-ом.
// Полная схема: https://yookassa.ru/developers/api

export interface YookassaAmount {
  value: string
  currency: string
}

export interface YookassaConfirmation {
  type: string
  confirmation_url?: string
  return_url?: string
}

export type YookassaPaymentStatus =
  | "pending"
  | "waiting_for_capture"
  | "succeeded"
  | "canceled"

export interface YookassaPayment {
  id: string
  status: YookassaPaymentStatus
  paid: boolean
  amount: YookassaAmount
  confirmation?: YookassaConfirmation
  description?: string
  metadata?: Record<string, string>
  created_at: string
}

export interface CreatePaymentParams {
  amount: number
  description: string
  returnUrl: string
  idempotenceKey: string
  metadata?: Record<string, string>
}

export type YookassaRefundStatus = "pending" | "succeeded" | "canceled"

export interface YookassaRefund {
  id: string
  status: YookassaRefundStatus
  payment_id: string
  amount: YookassaAmount
  created_at: string
}

export interface CreateRefundParams {
  paymentId: string
  amount: number
  idempotenceKey: string
}
