import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGame } from "@/lib/games/registry";
import { floatStream, newServerSeed, shuffled } from "@/lib/fair";

const ROWS = 8;

const schema = z.object({
  stake: z.number().int().positive(),
  tilesPerRow: z.number().int().min(2).max(4),
  safeTiles: z.number().int().min(1).max(3),
  clientSeed: z.string().min(1).max(64),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { stake, tilesPerRow, safeTiles, clientSeed } = parsed.data;
  if (safeTiles >= tilesPerRow) {
    return NextResponse.json({ error: "safeTiles must be less than tilesPerRow" }, { status: 400 });
  }

  const game = getGame("tower");
  if (!game) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  if (stake < game.minStake || stake > game.maxStake) {
    return NextResponse.json({ error: "Stake out of range" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const active = await tx.towerRound.findFirst({ where: { userId, status: "active" } });
    if (active) throw new Error("You already have a climb in progress");

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.coins < stake) throw new Error("Insufficient balance");

    const serverSeed = newServerSeed();
    const nonce = Date.now();
    const next = floatStream(serverSeed, clientSeed, nonce);
    const tileIndices = Array.from({ length: tilesPerRow }, (_, i) => i);
    const layout = Array.from({ length: ROWS }, () => shuffled(next, tileIndices).slice(0, safeTiles));

    await tx.wallet.update({ where: { userId }, data: { coins: { decrement: stake } } });
    await tx.transaction.create({
      data: { userId, type: "BET", coinsDelta: -stake, note: "Bet on tower" },
    });

    const round = await tx.towerRound.create({
      data: {
        userId, stake, tilesPerRow, safeTiles, rows: ROWS, layout: JSON.stringify(layout),
        serverSeed, clientSeed, nonce: BigInt(nonce),
      },
    });

    return round;
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({
    roundId: result.id, tilesPerRow: result.tilesPerRow, safeTiles: result.safeTiles,
    rows: result.rows, stake: result.stake,
  });
}
