import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Lets the client resume an in-progress round after a page refresh — the stake is already
// deducted and locked into it, so without this a refresh would strand the player.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const round = await prisma.hiLoRound.findFirst({ where: { userId, status: "active" } });
  if (!round) return NextResponse.json({ round: null });

  return NextResponse.json({
    round: { roundId: round.id, stake: round.stake, current: round.currentCard },
  });
}
