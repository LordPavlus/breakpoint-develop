import { yookassaRequest } from "./client"
import type { CreatePaymentParams, YookassaPayment } from "@/types/yookassa"

export async function createPayment(
  params: CreatePaymentParams
): Promise<YookassaPayment> {
  return yookassaRequest<YookassaPayment>("/payments", {
    method: "POST",
    idempotenceKey: params.idempotenceKey,
    body: {
      amount: { value: params.amount.toFixed(2), currency: "RUB" },
      capture: true,
      description: params.description,
      confirmation: { type: "redirect", return_url: params.returnUrl },
      metadata: params.metadata,
    },
  })
}

export async function getPayment(paymentId: string): Promise<YookassaPayment> {
  return yookassaRequest<YookassaPayment>(`/payments/${paymentId}`)
}
