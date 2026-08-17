import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { completeDeposit } from "@/lib/deposits";

const COINS_PER_EUR = 100;
const schema = z.object({
  userId: z.string().min(1),
  eurAmount: z.number().positive().max(10000),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).default("PENDING"),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { userId, eurAmount, status } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const tx = await prisma.transaction.create({
    data: {
      userId, type: "DEPOSIT", status: "PENDING",
      coinsDelta: Math.round(eurAmount * COINS_PER_EUR), eurAmount,
      note: "Added manually from admin panel",
    },
  });

  if (status === "COMPLETED") await completeDeposit(tx.id);
  else if (status === "FAILED") await prisma.transaction.update({ where: { id: tx.id }, data: { status: "FAILED" } });

  return NextResponse.json({ ok: true });
}
