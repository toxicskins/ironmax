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

    // Standing on hand A of a split just moves play to hand B — only standing on the last hand
    // (or a non-split round) actually brings in the dealer and settles.
    if (round.activeHand === 0 && round.splitCards) {
      await tx.blackjackRound.update({ where: { id: roundId }, data: { activeHand: 1, handADone: true } });
      return {
        handA: JSON.parse(round.playerCards) as string[],
        handB: JSON.parse(round.splitCards) as string[],
        activeHand: 1, finished: false, movedToHandB: true,
      };
    }

    return settleDealer(tx, round);
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
