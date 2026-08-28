import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Lets the client resume an in-progress hand after a page refresh — chips already committed
// this hand are already locked in, so without this a refresh would strand the player mid-hand.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const round = await prisma.holdemRound.findFirst({ where: { userId, status: "active" } });
  if (!round) return NextResponse.json({ round: null });

  const deck = JSON.parse(round.deck) as string[];
  return NextResponse.json({
    round: {
      roundId: round.id,
      stake: round.stake,
      pot: round.pot,
      player: deck.slice(0, 2),
      community: deck.slice(4, 4 + round.revealedCount),
      street: round.street,
      toCall: round.toCall,
      raisesThisStreet: round.raisesThisStreet,
      playerCommitted: round.playerCommitted,
      botCommitted: round.botCommitted,
    },
  });
}
