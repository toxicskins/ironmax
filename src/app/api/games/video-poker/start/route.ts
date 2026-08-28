import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGame, freshDeck } from "@/lib/games/registry";
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

  const game = getGame("video-poker");
  if (!game) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  if (stake < game.minStake || stake > game.maxStake) {
    return NextResponse.json({ error: "Stake out of range" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const active = await tx.holdemRound.findFirst({ where: { userId, status: "active" } });
    if (active) throw new Error("You already have a hand in progress");

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.coins < stake) throw new Error("Insufficient balance");

    const serverSeed = newServerSeed();
    const nonce = Date.now();
    const next = floatStream(serverSeed, clientSeed, nonce);
    const deck = shuffled(next, freshDeck());

    // Both the player's ante and the bot's matching ante (backed by the house) go into the pot —
    // heads-up Hold'em with blinds would need a dealer-button rotation that doesn't mean anything
    // against a single fixed bot, so a flat matched ante stands in for the blinds.
    await tx.wallet.update({ where: { userId }, data: { coins: { decrement: stake } } });
    await tx.transaction.create({
      data: { userId, type: "BET", coinsDelta: -stake, note: "Ante on Texas Hold'em" },
    });

    const round = await tx.holdemRound.create({
      data: {
        userId, stake, deck: JSON.stringify(deck),
        pot: stake * 2, playerCommitted: stake, botCommitted: stake,
        serverSeed, clientSeed, nonce: BigInt(nonce),
      },
    });

    return round;
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  const deck = JSON.parse(result.deck) as string[];
  return NextResponse.json({
    roundId: result.id,
    stake: result.stake,
    pot: result.pot,
    player: deck.slice(0, 2),
    street: result.street,
    toCall: result.toCall,
    raisesThisStreet: result.raisesThisStreet,
  });
}
