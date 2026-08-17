import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaynetWebhook } from "@/lib/paynet";
import { completeDeposit } from "@/lib/deposits";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paynet-signature");
  if (!verifyPaynetWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { order_id: string; status: string };
  if (event.status !== "completed") return NextResponse.json({ ok: true });

  const tx = await prisma.transaction.findUnique({ where: { id: event.order_id } });
  if (!tx) return NextResponse.json({ ok: true });

  await completeDeposit(tx.id);
  return NextResponse.json({ ok: true });
}
