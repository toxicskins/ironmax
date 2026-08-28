import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGame, freshDeck, dealBaccaratInitial } from "@/lib/games/registry";
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

  const game = getGame("baccarat");
  if (!game) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  if (stake < game.minStake || stake > game.maxStake) {
    return NextResponse.json({ error: "Stake out of range" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const active = await tx.baccaratRound.findFirst({ where: { userId, status: "active" } });
    if (active) throw new Error("You already have a round in progress");

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.coins < stake) throw new Error("Insufficient balance");

    const serverSeed = newServerSeed();
    const nonce = Date.now();
    const next = floatStream(serverSeed, clientSeed, nonce);
    const deck = shuffled(next, freshDeck());
    const { player, banker } = dealBaccaratInitial(deck);

    await tx.wallet.update({ where: { userId }, data: { coins: { decrement: stake } } });
    await tx.transaction.create({
      data: { userId, type: "BET", coinsDelta: -stake, note: "Bet on baccarat" },
    });

    const round = await tx.baccaratRound.create({
      data: {
        userId, stake, deck: JSON.stringify(deck),
        playerCards: JSON.stringify(player), bankerCards: JSON.stringify(banker),
        serverSeed, clientSeed, nonce: BigInt(nonce),
      },
    });

    return round;
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({
    roundId: result.id,
    stake: result.stake,
    player: JSON.parse(result.playerCards) as string[],
  });
}
