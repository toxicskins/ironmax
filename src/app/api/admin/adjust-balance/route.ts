import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({ userId: z.string(), coinsDelta: z.number().int(), note: z.string().optional() });

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { userId, coinsDelta, note } = parsed.data;

  await prisma.$transaction([
    prisma.wallet.update({ where: { userId }, data: { coins: { increment: coinsDelta } } }),
    prisma.transaction.create({
      data: { userId, type: "ADMIN_ADJUST", coinsDelta, note: note ?? "Manual adjustment" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
