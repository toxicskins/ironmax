import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RTP_TARGET } from "@/lib/games/registry";

const schema = z.object({
  roundId: z.string().min(1),
  index: z.number().int().min(0).max(24),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { roundId, index } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const round = await tx.minesRound.findUnique({ where: { id: roundId } });
    if (!round || round.userId !== userId) throw new Error("Round not found");
    if (round.status !== "active") throw new Error("Round already ended");

    const grid = JSON.parse(round.grid) as boolean[];
    const revealed = JSON.parse(round.revealed) as number[];
    if (revealed.includes(index)) throw new Error("Tile already picked");

    const isMine = grid[index];
    if (isMine) {
      await tx.minesRound.update({ where: { id: roundId }, data: { status: "busted" } });
      await tx.bet.create({
        data: {
          userId, gameKey: "mines", stake: round.stake, payout: 0,
          serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
          resultJson: JSON.stringify({ grid, revealed, hitIndex: index, mineCount: round.mineCount }),
        },
      });
      return { mine: true, grid, revealed, multiplier: 0 };
    }

    const nextRevealed = [...revealed, index];
    const safeOdds = 1 - round.mineCount / 25;
    const multiplier = Math.pow(1 / safeOdds, nextRevealed.length) * RTP_TARGET;
    await tx.minesRound.update({ where: { id: roundId }, data: { revealed: JSON.stringify(nextRevealed) } });
    return { mine: false, revealed: nextRevealed, multiplier, tilesLeft: 25 - round.mineCount - nextRevealed.length };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
