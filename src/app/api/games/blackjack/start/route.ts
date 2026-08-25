import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGame, blackjackValue, freshDeck } from "@/lib/games/registry";
import { floatStream, newServerSeed, shuffled } from "@/lib/fair";

const schema = z.object({
  stake: z.number().int().positive(),
  clientSeed: z.string().min(1).max(64),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { stake, clientSeed } = parsed.data;

  const game = getGame("blackjack");
  if (!game) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  if (stake < game.minStake || stake > game.maxStake) {
    return NextResponse.json({ error: "Stake out of range" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const active = await tx.blackjackRound.findFirst({ where: { userId, status: "active" } });
    if (active) throw new Error("You already have a hand in progress");

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.coins < stake) throw new Error("Insufficient balance");

    const serverSeed = newServerSeed();
    const nonce = Date.now();
    const next = floatStream(serverSeed, clientSeed, nonce);
    const deck = shuffled(next, freshDeck());
    const player = [deck[0], deck[1]];
    const dealer = [deck[2], deck[3]];

    await tx.wallet.update({ where: { userId }, data: { coins: { decrement: stake } } });
    await tx.transaction.create({
      data: { userId, type: "BET", coinsDelta: -stake, note: "Bet on blackjack" },
    });

    const pv = blackjackValue(player);
    const dv = blackjackValue(dealer);
    const playerNatural = pv === 21;
    const dealerNatural = dv === 21;

    // A natural on the deal leaves no room for player choices, so it settles immediately —
    // matching real blackjack, where a dealt 21 never gets offered Hit/Stand/Double.
    if (playerNatural || dealerNatural) {
      const multiplier = playerNatural && dealerNatural ? 1 : playerNatural ? 2.5 : 0;
      const payout = Math.floor(stake * multiplier);
      const round = await tx.blackjackRound.create({
        data: {
          userId, stake, deck: JSON.stringify(deck), drawIndex: 4,
          playerCards: JSON.stringify(player), dealerCards: JSON.stringify(dealer),
          status: "finished", serverSeed, clientSeed, nonce: BigInt(nonce),
        },
      });
      if (payout > 0) {
        await tx.wallet.update({ where: { userId }, data: { coins: { increment: payout } } });
        await tx.transaction.create({
          data: { userId, type: "WIN", coinsDelta: payout, note: "Win on blackjack" },
        });
      }
      await tx.bet.create({
        data: {
          userId, gameKey: "blackjack", stake, payout, serverSeed, clientSeed, nonce: BigInt(nonce),
          resultJson: JSON.stringify({ player, dealer, pv, dv }),
        },
      });
      return {
        roundId: round.id, stake, player, dealer, status: "finished" as const,
        payout, netDelta: payout - stake, pv, dv,
      };
    }

    const round = await tx.blackjackRound.create({
      data: {
        userId, stake, deck: JSON.stringify(deck), drawIndex: 4,
        playerCards: JSON.stringify(player), dealerCards: JSON.stringify(dealer),
        serverSeed, clientSeed, nonce: BigInt(nonce),
      },
    });
    return { roundId: round.id, stake, player, pv, dealerUpCard: dealer[0], status: "active" as const };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
