import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPaynetPayment } from "@/lib/paynet";

const COINS_PER_EUR = 100;
const schema = z.object({
  eurAmount: z.number().positive().max(1000),
  paymentMethodId: z.string().min(1),
  billing: z.object({
    firstName: z.string().min(1), lastName: z.string().min(1),
    street: z.string().min(1), city: z.string().min(1), postalCode: z.string().min(1), country: z.string().min(1),
    phone: z.string().min(1),
  }).optional(),
});

function requestIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "127.0.0.1";
}

function publicOrigin(req: Request) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost?.split(",")[0]?.trim() || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || new URL(req.url).protocol.replace(":", "");
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  const coins = Math.round(parsed.data.eurAmount * COINS_PER_EUR);
  const { billing } = parsed.data;

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: { id: parsed.data.paymentMethodId, active: true },
  });
  if (!paymentMethod) return NextResponse.json({ error: "Payment method is unavailable" }, { status: 400 });

  const pending = await prisma.transaction.create({
    data: {
      userId, type: "DEPOSIT", status: "PENDING",
      paymentMethodId: paymentMethod.id,
      coinsDelta: coins, eurAmount: parsed.data.eurAmount,
      billingName: billing ? `${billing.firstName} ${billing.lastName}`.trim() : null,
      billingPhone: billing?.phone ?? null,
      billingAddress: billing ? `${billing.street}, ${billing.city} ${billing.postalCode}, ${billing.country}` : null,
    },
  });

  try {
    const origin = publicOrigin(req);
    const payment = await createPaynetPayment({
      orderId: pending.id,
      amountEur: parsed.data.eurAmount,
      customerEmail: session.user.email!,
      returnUrl: `${origin}/payment/status?order=${pending.id}`,
      callbackUrl: `${origin}/api/webhooks/paynet`,
      ipAddress: requestIp(req),
      billing,
      credentials: paymentMethod,
    });

    await prisma.transaction.update({
      where: { id: pending.id },
      data: { paynetOrderId: payment.payment_id },
    });

    return NextResponse.json({ paymentUrl: payment.payment_url });
  } catch (error) {
    await prisma.transaction.update({
      where: { id: pending.id },
      data: { status: "FAILED", note: error instanceof Error ? error.message : "PayNet Easy payment creation failed" },
    });
    return NextResponse.json({ error: "Payment provider error" }, { status: 502 });
  }
}
