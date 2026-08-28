import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bestHandRank, compareRank, botFacingBet, botFacingCheck, botFacingAllIn } from "@/lib/games/holdem";

const schema = z.object({
  roundId: z.string().min(1),
  action: z.enum(["fold", "check", "call", "raise", "allin"]),
  amount: z.number().int().positive().optional(), // raise only: total chips to commit this action
});

const STREET_ORDER = ["preflop", "flop", "turn", "river"] as const;
type Street = (typeof STREET_ORDER)[number];
const REVEAL_FOR: Record<Street, number> = { preflop: 0, flop: 3, turn: 4, river: 5 };
const RAISE_CAP = 2; // total raises allowed per street, across both sides — keeps no-limit heads-up bounded

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { roundId, action, amount: requestedAmount } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const result = await prisma.$transaction(async (tx) => {
    const round = await tx.holdemRound.findUnique({ where: { id: roundId } });
    if (!round || round.userId !== userId) throw new Error("Hand not found");
    if (round.status !== "active") throw new Error("Hand already ended");

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("No wallet");

    const deck = JSON.parse(round.deck) as string[];
    const playerHole = deck.slice(0, 2);
    const botHole = deck.slice(2, 4);
    const board = deck.slice(4, 9);

    let { pot, playerCommitted, botCommitted, toCall, raisesThisStreet, revealedCount } = round;
    let street = round.street as Street;
    let debit = 0;
    let finished = false;
    let winner: "player" | "bot" | "split" | null = null;

    function communityNow() { return board.slice(0, revealedCount); }

    function advanceStreetOrShowdown() {
      raisesThisStreet = 0;
      const idx = STREET_ORDER.indexOf(street);
      if (idx === STREET_ORDER.length - 1) {
        revealedCount = 5;
        finished = true;
        const cmp = compareRank(bestHandRank([...playerHole, ...board]), bestHandRank([...botHole, ...board]));
        winner = cmp > 0 ? "player" : cmp < 0 ? "bot" : "split";
      } else {
        street = STREET_ORDER[idx + 1];
        revealedCount = REVEAL_FOR[street];
      }
    }

    if (action === "fold") {
      finished = true;
      winner = "bot";
    } else if (action === "check") {
      if (toCall !== 0) throw new Error("You have to call or fold");
      const botMove = botFacingCheck(botHole, communityNow());
      if (botMove === "check") {
        advanceStreetOrShowdown();
      } else {
        pot += round.stake; botCommitted += round.stake; toCall = round.stake; raisesThisStreet += 1;
      }
    } else if (action === "call") {
      if (toCall <= 0) throw new Error("Nothing to call");
      if (toCall > wallet.coins) throw new Error("Insufficient balance to call");
      debit = toCall;
      pot += toCall; playerCommitted += toCall; toCall = 0;
      advanceStreetOrShowdown();
    } else if (action === "raise") {
      if (raisesThisStreet >= RAISE_CAP) throw new Error("No more raises allowed this street");
      const amount = requestedAmount ?? toCall + round.stake;
      if (amount <= toCall) throw new Error("Raise must be more than the amount to call");
      if (amount > wallet.coins) throw new Error("Insufficient balance to raise");
      debit = amount;
      pot += amount; playerCommitted += amount; raisesThisStreet += 1;
      const raiseSize = amount - toCall; // the actual increment above the call, for the bot's re-raise
      const canBotRaise = raisesThisStreet < RAISE_CAP;
      const botMove = botFacingBet(botHole, communityNow(), canBotRaise);
      if (botMove === "fold") {
        finished = true; winner = "player";
      } else if (botMove === "call") {
        const committedDiff = playerCommitted - botCommitted;
        pot += committedDiff; botCommitted += committedDiff; toCall = 0;
        advanceStreetOrShowdown();
      } else {
        const committedDiff = playerCommitted - botCommitted;
        pot += committedDiff + raiseSize; botCommitted += committedDiff + raiseSize; toCall = raiseSize; raisesThisStreet += 1;
      }
    } else if (action === "allin") {
      if (wallet.coins <= 0) throw new Error("No balance left to go all-in");
      debit = wallet.coins;
      pot += debit; playerCommitted += debit; toCall = 0;
      revealedCount = 5; // no more betting is possible, so the whole board shows immediately
      const botMove = botFacingAllIn(botHole, board);
      if (botMove === "fold") {
        finished = true; winner = "player";
      } else {
        const matchAmount = Math.max(0, playerCommitted - botCommitted);
        pot += matchAmount; botCommitted += matchAmount;
        finished = true;
        const cmp = compareRank(bestHandRank([...playerHole, ...board]), bestHandRank([...botHole, ...board]));
        winner = cmp > 0 ? "player" : cmp < 0 ? "bot" : "split";
      }
    }

    if (debit > 0) {
      await tx.wallet.update({ where: { userId }, data: { coins: { decrement: debit } } });
      await tx.transaction.create({
        data: { userId, type: "BET", coinsDelta: -debit, note: "Bet on Texas Hold'em" },
      });
    }

    await tx.holdemRound.update({
      where: { id: roundId },
      data: {
        pot, playerCommitted, botCommitted, toCall, raisesThisStreet, revealedCount, street,
        status: finished ? "finished" : "active",
      },
    });

    let payout = 0;
    if (finished) {
      payout = winner === "player" ? pot : winner === "split" ? Math.floor(pot / 2) : 0;
      if (payout > 0) {
        await tx.wallet.update({ where: { userId }, data: { coins: { increment: payout } } });
        await tx.transaction.create({
          data: { userId, type: "WIN", coinsDelta: payout, note: "Win on Texas Hold'em" },
        });
      }
      await tx.bet.create({
        data: {
          userId, gameKey: "video-poker", stake: playerCommitted, payout,
          serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
          resultJson: JSON.stringify({ player: playerHole, bot: botHole, board, winner }),
        },
      });
    }

    return {
      pot, toCall, street, raisesThisStreet, revealedCount,
      community: board.slice(0, revealedCount),
      playerCommitted, botCommitted,
      finished, winner,
      bot: finished ? botHole : null,
      payout, netDelta: finished ? payout - playerCommitted : 0,
    };
  }).catch((e: Error) => e);

  if (result instanceof Error) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result);
}
