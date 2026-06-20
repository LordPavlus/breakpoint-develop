import { yookassaRequest } from "./client"
import type { CreateRefundParams, YookassaRefund } from "@/types/yookassa"

export async function createRefund(params: CreateRefundParams): Promise<YookassaRefund> {
  return yookassaRequest<YookassaRefund>("/refunds", {
    method: "POST",
    idempotenceKey: params.idempotenceKey,
    body: {
      payment_id: params.paymentId,
      amount: { value: params.amount.toFixed(2), currency: "RUB" },
    },
  })
}
