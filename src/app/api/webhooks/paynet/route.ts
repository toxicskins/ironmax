import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaynetWebhook } from "@/lib/paynet";
import { completeDeposit } from "@/lib/deposits";

async function handleCallback(params: URLSearchParams) {
  const merchantOrder = params.get("merchant_order") ?? params.get("client_orderid");
  if (!merchantOrder) return NextResponse.json({ ok: true });

  const tx = await prisma.transaction.findUnique({
    where: { id: merchantOrder },
    include: { paymentMethod: true },
  });
  if (!tx) return NextResponse.json({ ok: true });

  if (!verifyPaynetWebhook(params, tx.paymentMethod?.paynetSigningKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const status = params.get("status");
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

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  return handleCallback(new URL(req.url).searchParams);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  return handleCallback(new URLSearchParams(rawBody));
}
