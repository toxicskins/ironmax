import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { freshDeck, rankValue } from "@/lib/games/registry";
import { floatStream, shuffled } from "@/lib/fair";

const schema = z.object({
  roundId: z.string().min(1),
  guess: z.enum(["higher", "lower"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { roundId, guess } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const round = await tx.hiLoRound.findUnique({ where: { id: roundId } });
    if (!round || round.userId !== userId) throw new Error("Round not found");
    if (round.status !== "active") throw new Error("Round already ended");

    // A fresh, independent draw for the next card — reusing the round's own serverSeed/clientSeed
    // but a different nonce so it isn't just re-deriving the same shuffle as the start draw, and
    // excluding the exact current card so the same physical card can't reappear.
    const next = floatStream(round.serverSeed, round.clientSeed, Number(round.nonce) + 1);
    const deck = freshDeck().filter((c) => c !== round.currentCard);
    const nextCard = shuffled(next, deck)[0];

    const cv = rankValue(round.currentCard);
    const nv = rankValue(nextCard);
    const win = (guess === "higher" && nv > cv) || (guess === "lower" && nv < cv);
    const multiplier = win ? 2.04 : 0;
    const payout = Math.floor(round.stake * multiplier);

    await tx.hiLoRound.update({ where: { id: roundId }, data: { status: "finished" } });
    if (payout > 0) {
      await tx.wallet.update({ where: { userId }, data: { coins: { increment: payout } } });
      await tx.transaction.create({
        data: { userId, type: "WIN", coinsDelta: payout, note: "Win on hilo" },
      });
    }
    await tx.bet.create({
      data: {
        userId, gameKey: "hilo", stake: round.stake, payout,
        serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
        resultJson: JSON.stringify({ current: round.currentCard, nextCard, guess }),
      },
    });

    return { current: round.currentCard, nextCard, guess, win, payout, netDelta: payout - round.stake };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
