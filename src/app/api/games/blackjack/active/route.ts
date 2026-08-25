import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { blackjackValue } from "@/lib/games/registry";

// Lets the client resume an in-progress hand after a page refresh — the stake is already
// deducted and locked into it, so without this a refresh would strand the player.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const round = await prisma.blackjackRound.findFirst({ where: { userId, status: "active" } });
  if (!round) return NextResponse.json({ round: null });

  const player = JSON.parse(round.playerCards) as string[];
  return NextResponse.json({
    round: {
      roundId: round.id,
      stake: round.stake,
      player,
      pv: blackjackValue(player),
      dealerUpCard: (JSON.parse(round.dealerCards) as string[])[0],
      doubled: round.doubled,
    },
  });
}
