import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGame } from "@/lib/games/registry";
import { floatStream, newServerSeed } from "@/lib/fair";

const schema = z.object({
  gameKey: z.string(),
  stake: z.number().int().positive(),
  clientSeed: z.string().min(1).max(64),
  params: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { gameKey, stake, clientSeed, params } = parsed.data;

  const game = getGame(gameKey);
  if (!game) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  if (stake < game.minStake || stake > game.maxStake) {
    return NextResponse.json({ error: "Stake out of range" }, { status: 400 });
  }
  const paramsError = game.validateParams?.(params);
  if (paramsError) return NextResponse.json({ error: paramsError }, { status: 400 });

  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.coins < stake) throw new Error("Insufficient balance");

    // ponytail: serverSeed is generated and revealed in the same request instead of pre-committed
    // (hash shown before the bet, seed after). Fine for an MVP; upgrade to seed-commit rotation
    // before marketing this as "provably fair" to players.
    const serverSeed = newServerSeed();
    const nonce = Date.now();
    const next = floatStream(serverSeed, clientSeed, nonce);
    const outcome = game.play(next, params);
    const payout = Math.floor(stake * outcome.multiplier);
    const netDelta = payout - stake;

    await tx.wallet.update({
      where: { userId },
      data: { coins: { increment: netDelta } },
    });

    const bet = await tx.bet.create({
      data: {
        userId, gameKey, stake, payout, serverSeed, clientSeed, nonce: BigInt(nonce),
        resultJson: JSON.stringify(outcome.detail),
      },
    });

    await tx.transaction.create({
      data: { userId, type: "BET", coinsDelta: -stake, note: `Bet on ${gameKey}` },
    });
    if (payout > 0) {
      await tx.transaction.create({
        data: { userId, type: "WIN", coinsDelta: payout, note: `Win on ${gameKey}` },
      });
    }

    return { bet, outcome, payout, netDelta };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({
    payout: result.payout,
    netDelta: result.netDelta,
    detail: result.outcome.detail,
    multiplier: result.outcome.multiplier,
    fairness: { serverSeed: result.bet.serverSeed, clientSeed: result.bet.clientSeed, nonce: Number(result.bet.nonce) },
  });
}
