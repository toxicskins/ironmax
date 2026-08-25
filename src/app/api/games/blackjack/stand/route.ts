import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { settleDealer } from "../_settle";

const schema = z.object({ roundId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { roundId } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const round = await tx.blackjackRound.findUnique({ where: { id: roundId } });
    if (!round || round.userId !== userId) throw new Error("Hand not found");
    if (round.status !== "active") throw new Error("Hand already ended");

    return settleDealer(tx, round);
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
