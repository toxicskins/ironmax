import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { completeDeposit } from "@/lib/deposits";

const schema = z.object({ status: z.enum(["PENDING", "COMPLETED", "FAILED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.type !== "DEPOSIT") return NextResponse.json({ error: "Deposit not found" }, { status: 404 });

  if (parsed.data.status === "COMPLETED") {
    // Credits the wallet + generates/emails the invoice — only if it isn't already completed,
    // so flipping the dropdown back and forth can't double-credit the user.
    await completeDeposit(id);
  } else {
    await prisma.transaction.update({ where: { id }, data: { status: parsed.data.status } });
  }

  return NextResponse.json({ ok: true });
}
