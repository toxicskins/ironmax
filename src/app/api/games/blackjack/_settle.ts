import type { Prisma } from "@prisma/client";
import { blackjackValue } from "@/lib/games/registry";

type RoundLike = {
  id: string; userId: string; stake: number; deck: string; drawIndex: number;
  playerCards: string; dealerCards: string; serverSeed: string; clientSeed: string; nonce: bigint;
  splitCards: string | null; handABust: boolean;
};

/** Dealer hits to 17 and stands, then the hand (or both hands, if split) is compared and paid
 * out against the same dealer total — shared by Stand, Double, and the 2nd half of a Split. */
export async function settleDealer(tx: Prisma.TransactionClient, round: RoundLike) {
  const deck = JSON.parse(round.deck) as string[];
  const handA = JSON.parse(round.playerCards) as string[];
  const handB = round.splitCards ? (JSON.parse(round.splitCards) as string[]) : null;
  const dealer = [...(JSON.parse(round.dealerCards) as string[])];
  let drawIndex = round.drawIndex;

  const pvA = blackjackValue(handA);
  const pvB = handB ? blackjackValue(handB) : null;
  // The dealer only has to play at all if at least one hand is still live to beat.
  const anyLive = !round.handABust || (pvB !== null && pvB <= 21);
  if (anyLive) {
    while (blackjackValue(dealer) < 17 && drawIndex < deck.length) {
      dealer.push(deck[drawIndex++]);
    }
  }
  const dv = blackjackValue(dealer);

  function payoutFor(pv: number, bust: boolean) {
    if (bust) return 0;
    if (dv > 21 || pv > dv) return Math.floor(round.stake * 2);
    if (pv === dv) return round.stake;
    return 0;
  }

  const payoutA = payoutFor(pvA, round.handABust);
  const payoutB = handB && pvB !== null ? payoutFor(pvB, pvB > 21) : 0;
  const payout = payoutA + payoutB;
  const totalStake = round.stake * (handB ? 2 : 1);

  await tx.blackjackRound.update({
    where: { id: round.id },
    data: { dealerCards: JSON.stringify(dealer), drawIndex, status: "finished" },
  });
  if (payout > 0) {
    await tx.wallet.update({ where: { userId: round.userId }, data: { coins: { increment: payout } } });
    await tx.transaction.create({
      data: { userId: round.userId, type: "WIN", coinsDelta: payout, note: "Win on blackjack" },
    });
  }
  await tx.bet.create({
    data: {
      userId: round.userId, gameKey: "blackjack", stake: totalStake, payout,
      serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
      resultJson: JSON.stringify({ handA, handB, dealer, pvA, pvB, dv }),
    },
  });

  return {
    handA, handB, activeHand: handB ? 1 : 0, finished: true,
    dealer, pvA, pvB, dv, payout, netDelta: payout - totalStake,
  };
}
