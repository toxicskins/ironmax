import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { blackjackValue } from "@/lib/games/registry";

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

    const deck = JSON.parse(round.deck) as string[];
    const player = [...(JSON.parse(round.playerCards) as string[]), deck[round.drawIndex]];
    const pv = blackjackValue(player);
    const bust = pv > 21;

    await tx.blackjackRound.update({
      where: { id: roundId },
      data: { playerCards: JSON.stringify(player), drawIndex: round.drawIndex + 1, status: bust ? "finished" : "active" },
    });

    if (bust) {
      await tx.bet.create({
        data: {
          userId, gameKey: "blackjack", stake: round.stake, payout: 0,
          serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
          resultJson: JSON.stringify({ player, dealer: JSON.parse(round.dealerCards), pv, bust: true }),
        },
      });
    }

    return { player, pv, bust };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
