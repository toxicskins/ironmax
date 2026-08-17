import crypto from "crypto";

// Thin wrapper around PayNet Easy's REST API. Endpoint/field names follow their merchant API
// pattern (end-point-id + signing key, HMAC-signed requests). Confirm exact field names against
// your PayNet Easy merchant dashboard/API docs before going live — plug real values into .env.
const PAYNET_API_URL = process.env.PAYNET_API_URL ?? "https://api.paynet.easy";
const PAYNET_END_POINT_ID = process.env.PAYNET_END_POINT_ID ?? "";
const PAYNET_SIGNING_KEY = process.env.PAYNET_SIGNING_KEY ?? "";

function sign(payload: string) {
  return crypto.createHmac("sha256", PAYNET_SIGNING_KEY).update(payload).digest("hex");
}

export async function createPaynetPayment(opts: {
  orderId: string;
  amountEur: number;
  customerEmail: string;
  returnUrl: string;
}) {
  const payload = {
    end_point_id: PAYNET_END_POINT_ID,
    order_id: opts.orderId,
    amount: opts.amountEur.toFixed(2),
    currency: "EUR",
    customer_email: opts.customerEmail,
    return_url: opts.returnUrl,
  };
  const body = JSON.stringify(payload);
  const res = await fetch(`${PAYNET_API_URL}/v1/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": sign(body) },
    body,
  });
  if (!res.ok) throw new Error(`PayNet Easy error: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ payment_url: string; payment_id: string }>;
}

/** Verifies the HMAC signature PayNet Easy sends on the deposit-confirmed webhook. */
export function verifyPaynetWebhook(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;
  const expected = sign(rawBody);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}
