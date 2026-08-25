import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RTP_TARGET } from "@/lib/games/registry";

const schema = z.object({ roundId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { roundId } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const round = await tx.minesRound.findUnique({ where: { id: roundId } });
    if (!round || round.userId !== userId) throw new Error("Round not found");
    if (round.status !== "active") throw new Error("Round already ended");

    const revealed = JSON.parse(round.revealed) as number[];
    if (revealed.length === 0) throw new Error("Reveal at least one tile before cashing out");

    const grid = JSON.parse(round.grid) as boolean[];
    const safeOdds = 1 - round.mineCount / 25;
    const multiplier = Math.pow(1 / safeOdds, revealed.length) * RTP_TARGET;
    const payout = Math.floor(round.stake * multiplier);

    await tx.minesRound.update({ where: { id: roundId }, data: { status: "cashed" } });
    await tx.wallet.update({ where: { userId }, data: { coins: { increment: payout } } });
    await tx.transaction.create({
      data: { userId, type: "WIN", coinsDelta: payout, note: "Win on mines" },
    });
    await tx.bet.create({
      data: {
        userId, gameKey: "mines", stake: round.stake, payout,
        serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
        resultJson: JSON.stringify({ grid, revealed, mineCount: round.mineCount, cashedOut: true }),
      },
    });

    return { payout, netDelta: payout - round.stake, grid, multiplier };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
