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
    const round = await tx.towerRound.findUnique({ where: { id: roundId } });
    if (!round || round.userId !== userId) throw new Error("Climb not found");
    if (round.status !== "active") throw new Error("Climb already ended");

    const climbed = JSON.parse(round.climbed) as number[];
    if (climbed.length === 0) throw new Error("Climb at least one floor before cashing out");

    const layout = JSON.parse(round.layout) as number[][];
    const multiplier = Math.pow(round.tilesPerRow / round.safeTiles, climbed.length) * RTP_TARGET;
    const payout = Math.floor(round.stake * multiplier);

    await tx.towerRound.update({ where: { id: roundId }, data: { status: "cashed" } });
    await tx.wallet.update({ where: { userId }, data: { coins: { increment: payout } } });
    await tx.transaction.create({
      data: { userId, type: "WIN", coinsDelta: payout, note: "Win on tower" },
    });
    await tx.bet.create({
      data: {
        userId, gameKey: "tower", stake: round.stake, payout,
        serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
        resultJson: JSON.stringify({ layout, climbed, cashedOut: true }),
      },
    });

    return { payout, netDelta: payout - round.stake, layout, multiplier };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
