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
    const player = JSON.parse(round.playerCards) as string[];
    if (player.length !== 2) throw new Error("Can only double on your first move");

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.coins < round.stake) throw new Error("Insufficient balance to double");

    await tx.wallet.update({ where: { userId }, data: { coins: { decrement: round.stake } } });
    await tx.transaction.create({
      data: { userId, type: "BET", coinsDelta: -round.stake, note: "Double down on blackjack" },
    });

    const deck = JSON.parse(round.deck) as string[];
    const newPlayer = [...player, deck[round.drawIndex]];
    const pv = blackjackValue(newPlayer);
    const doubledStake = round.stake * 2;

    const updated = await tx.blackjackRound.update({
      where: { id: roundId },
      data: {
        playerCards: JSON.stringify(newPlayer), drawIndex: round.drawIndex + 1,
        stake: doubledStake, doubled: true,
      },
    });

    if (pv > 21) {
      await tx.blackjackRound.update({ where: { id: roundId }, data: { status: "finished" } });
      await tx.bet.create({
        data: {
          userId, gameKey: "blackjack", stake: doubledStake, payout: 0,
          serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
          resultJson: JSON.stringify({ player: newPlayer, dealer: JSON.parse(round.dealerCards), pv, bust: true }),
        },
      });
      return { player: newPlayer, pv, bust: true, payout: 0, netDelta: -doubledStake };
    }

    return { bust: false, ...(await settleDealer(tx, updated)) };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
