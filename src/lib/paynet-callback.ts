import { completeDeposit } from "@/lib/deposits";
import { verifyPaynetWebhook } from "@/lib/paynet";
import { prisma } from "@/lib/prisma";

export type PaynetCallbackResult =
  | { found: false; verified: false; transactionId: null; status: null }
  | { found: true; verified: false; transactionId: string; status: string | null }
  | { found: true; verified: true; transactionId: string; status: string | null };

export async function handlePaynetCallback(params: URLSearchParams): Promise<PaynetCallbackResult> {
  const merchantOrder = params.get("merchant_order") ?? params.get("client_orderid") ?? params.get("order");
  if (!merchantOrder) return { found: false, verified: false, transactionId: null, status: null };

  const tx = await prisma.transaction.findUnique({
    where: { id: merchantOrder },
    include: { paymentMethod: true },
  });
  if (!tx) return { found: false, verified: false, transactionId: null, status: null };

  const status = params.get("status");
  const hasPaynetSignature = !!params.get("control");
  if (hasPaynetSignature && !verifyPaynetWebhook(params, tx.paymentMethod?.paynetSigningKey)) {
    return { found: true, verified: false, transactionId: tx.id, status };
  }

  const paynetOrderId = params.get("orderid");
  if (paynetOrderId && tx.paynetOrderId !== paynetOrderId) {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { paynetOrderId },
    });
  }

  if (status === "approved") {
    await completeDeposit(tx.id);
  } else if (status && status !== "processing") {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "FAILED", note: params.get("error_message") ?? params.get("error-message") ?? status },
    });
  }

  return { found: true, verified: hasPaynetSignature, transactionId: tx.id, status };
}
