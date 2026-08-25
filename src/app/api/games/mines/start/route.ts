import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGame } from "@/lib/games/registry";
import { floatStream, newServerSeed, shuffled } from "@/lib/fair";

const schema = z.object({
  stake: z.number().int().positive(),
  mineCount: z.number().int().min(1).max(24),
  clientSeed: z.string().min(1).max(64),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { stake, mineCount, clientSeed } = parsed.data;

  const game = getGame("mines");
  if (!game) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  if (stake < game.minStake || stake > game.maxStake) {
    return NextResponse.json({ error: "Stake out of range" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const active = await tx.minesRound.findFirst({ where: { userId, status: "active" } });
    if (active) throw new Error("You already have a round in progress");

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.coins < stake) throw new Error("Insufficient balance");

    const serverSeed = newServerSeed();
    const nonce = Date.now();
    const next = floatStream(serverSeed, clientSeed, nonce);
    const grid = shuffled(next, [...Array(25)].map((_, i) => i < mineCount));

    await tx.wallet.update({ where: { userId }, data: { coins: { decrement: stake } } });
    await tx.transaction.create({
      data: { userId, type: "BET", coinsDelta: -stake, note: "Bet on mines" },
    });

    const round = await tx.minesRound.create({
      data: {
        userId, stake, mineCount, grid: JSON.stringify(grid), serverSeed, clientSeed,
        nonce: BigInt(nonce),
      },
    });

    return round;
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ roundId: result.id, mineCount: result.mineCount, stake: result.stake });
}
