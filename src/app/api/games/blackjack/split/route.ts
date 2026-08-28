import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { settleDealer } from "../_settle";

const schema = z.object({ roundId: z.string().min(1) });

function rankOf(card: string) {
  return card.slice(0, -1);
}

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
    if (round.splitCards) throw new Error("Already split");
    if (round.doubled) throw new Error("Can't split after doubling");

    const player = JSON.parse(round.playerCards) as string[];
    if (player.length !== 2 || rankOf(player[0]) !== rankOf(player[1])) {
      throw new Error("Can only split a starting pair");
    }

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.coins < round.stake) throw new Error("Insufficient balance to split");

    await tx.wallet.update({ where: { userId }, data: { coins: { decrement: round.stake } } });
    await tx.transaction.create({
      data: { userId, type: "BET", coinsDelta: -round.stake, note: "Split on blackjack" },
    });

    const deck = JSON.parse(round.deck) as string[];
    let drawIndex = round.drawIndex;
    // Each split hand immediately gets a 2nd card, exactly like a real table.
    const handA = [player[0], deck[drawIndex++]];
    const handB = [player[1], deck[drawIndex++]];
    const isAces = rankOf(player[0]) === "A";

    const updated = await tx.blackjackRound.update({
      where: { id: roundId },
      data: {
        playerCards: JSON.stringify(handA), splitCards: JSON.stringify(handB), drawIndex,
        // Split aces get exactly one card each and stand immediately — a real-table rule, and
        // it also sidesteps re-splitting/soft-total edge cases we don't otherwise handle.
        activeHand: isAces ? 1 : 0, handADone: isAces,
      },
    });

    if (isAces) return settleDealer(tx, { ...updated, handABust: false });
    return { handA, handB, activeHand: 0, finished: false };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
