import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { blackjackValue } from "@/lib/games/registry";
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
    if (round.doubled) throw new Error("Already doubled — the hand is settling");

    const onHandB = round.activeHand === 1;
    const deck = JSON.parse(round.deck) as string[];
    const current = [...(JSON.parse(onHandB ? round.splitCards! : round.playerCards) as string[]), deck[round.drawIndex]];
    const pv = blackjackValue(current);
    const bust = pv > 21;

    const updated = await tx.blackjackRound.update({
      where: { id: roundId },
      data: {
        ...(onHandB ? { splitCards: JSON.stringify(current) } : { playerCards: JSON.stringify(current) }),
        drawIndex: round.drawIndex + 1,
      },
    });
    const handA = onHandB ? (JSON.parse(round.playerCards) as string[]) : current;
    const handB = onHandB ? current : (round.splitCards ? (JSON.parse(round.splitCards) as string[]) : null);

    if (!bust) {
      return { handA, handB, activeHand: round.activeHand, finished: false, bust: false };
    }

    // Busted this hand. If it was hand A and there's a hand B waiting, move on to hand B instead
    // of ending the round — the split's other hand still gets played out.
    if (!onHandB && round.splitCards) {
      await tx.blackjackRound.update({
        where: { id: roundId },
        data: { activeHand: 1, handADone: true, handABust: true },
      });
      return { handA, handB, activeHand: 1, finished: false, bust: true, movedToHandB: true };
    }

    return { bust: true, ...(await settleDealer(tx, { ...updated, handABust: round.handABust })) };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
