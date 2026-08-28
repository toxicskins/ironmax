import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveBaccaratTableau } from "@/lib/games/registry";

const schema = z.object({
  roundId: z.string().min(1),
  bet: z.enum(["player", "banker", "tie"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { roundId, bet } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const round = await tx.baccaratRound.findUnique({ where: { id: roundId } });
    if (!round || round.userId !== userId) throw new Error("Round not found");
    if (round.status !== "active") throw new Error("Round already ended");

    const deck = JSON.parse(round.deck) as string[];
    const initialPlayer = JSON.parse(round.playerCards) as string[];
    const initialBanker = JSON.parse(round.bankerCards) as string[];
    const { player, banker, pv, bv, winner } = resolveBaccaratTableau(deck, initialPlayer, initialBanker);

    const multiplier = bet === winner ? (winner === "tie" ? 9.7 : 2.13) : 0;
    const payout = Math.floor(round.stake * multiplier);

    await tx.baccaratRound.update({ where: { id: roundId }, data: { status: "finished" } });
    if (payout > 0) {
      await tx.wallet.update({ where: { userId }, data: { coins: { increment: payout } } });
      await tx.transaction.create({
        data: { userId, type: "WIN", coinsDelta: payout, note: "Win on baccarat" },
      });
    }
    await tx.bet.create({
      data: {
        userId, gameKey: "baccarat", stake: round.stake, payout,
        serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
        resultJson: JSON.stringify({ player, banker, pv, bv, winner, bet }),
      },
    });

    return { player, banker, pv, bv, winner, bet, payout, netDelta: payout - round.stake };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
