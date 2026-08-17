import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPaynetPayment } from "@/lib/paynet";

const COINS_PER_EUR = 100;
const schema = z.object({
  eurAmount: z.number().positive().max(1000),
  billing: z.object({
    firstName: z.string(), lastName: z.string(),
    street: z.string(), city: z.string(), postalCode: z.string(), country: z.string(),
    phone: z.string(),
  }).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  const coins = Math.round(parsed.data.eurAmount * COINS_PER_EUR);
  const { billing } = parsed.data;

  const pending = await prisma.transaction.create({
    data: {
      userId, type: "DEPOSIT", status: "PENDING",
      coinsDelta: coins, eurAmount: parsed.data.eurAmount,
      billingName: billing ? `${billing.firstName} ${billing.lastName}`.trim() : null,
      billingPhone: billing?.phone ?? null,
      billingAddress: billing ? `${billing.street}, ${billing.city} ${billing.postalCode}, ${billing.country}` : null,
    },
  });

  const payment = await createPaynetPayment({
    orderId: pending.id,
    amountEur: parsed.data.eurAmount,
    customerEmail: session.user.email!,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account?deposit=pending`,
  });

  await prisma.transaction.update({
    where: { id: pending.id },
    data: { paynetOrderId: payment.payment_id },
  });

  return NextResponse.json({ paymentUrl: payment.payment_url });
}
