import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RTP_TARGET } from "@/lib/games/registry";

const schema = z.object({
  roundId: z.string().min(1),
  tileIndex: z.number().int().min(0).max(3),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { roundId, tileIndex } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const round = await tx.towerRound.findUnique({ where: { id: roundId } });
    if (!round || round.userId !== userId) throw new Error("Climb not found");
    if (round.status !== "active") throw new Error("Climb already ended");
    if (tileIndex >= round.tilesPerRow) throw new Error("Tile out of range for this floor width");

    const layout = JSON.parse(round.layout) as number[][];
    const climbed = JSON.parse(round.climbed) as number[];
    const floor = climbed.length;
    if (floor >= round.rows) throw new Error("Already reached the top");

    const safe = layout[floor].includes(tileIndex);
    if (!safe) {
      await tx.towerRound.update({ where: { id: roundId }, data: { status: "busted" } });
      await tx.bet.create({
        data: {
          userId, gameKey: "tower", stake: round.stake, payout: 0,
          serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
          resultJson: JSON.stringify({ layout, climbed, bustFloor: floor, tileIndex }),
        },
      });
      return { safe: false, layout, climbed, floor };
    }

    const nextClimbed = [...climbed, tileIndex];
    const multiplier = Math.pow(round.tilesPerRow / round.safeTiles, nextClimbed.length) * RTP_TARGET;
    await tx.towerRound.update({ where: { id: roundId }, data: { climbed: JSON.stringify(nextClimbed) } });

    return {
      safe: true, climbed: nextClimbed, multiplier,
      atTop: nextClimbed.length === round.rows,
    };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
