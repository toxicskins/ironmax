import type { Prisma } from "@prisma/client";
import { blackjackValue } from "@/lib/games/registry";

/** Dealer hits to 17 and stands, then the hand is compared and paid out — shared by Stand and Double. */
export async function settleDealer(tx: Prisma.TransactionClient, round: {
  id: string; userId: string; stake: number; deck: string; drawIndex: number;
  playerCards: string; dealerCards: string; serverSeed: string; clientSeed: string; nonce: bigint;
}, multiplierOverride?: { win: number; push: number }) {
  const deck = JSON.parse(round.deck) as string[];
  const player = JSON.parse(round.playerCards) as string[];
  const dealer = [...(JSON.parse(round.dealerCards) as string[])];
  let drawIndex = round.drawIndex;

  const pv = blackjackValue(player);
  while (blackjackValue(dealer) < 17 && drawIndex < deck.length) {
    dealer.push(deck[drawIndex++]);
  }
  const dv = blackjackValue(dealer);

  const winMult = multiplierOverride?.win ?? 2;
  const pushMult = multiplierOverride?.push ?? 1;
  let multiplier = 0;
  if (dv > 21 || pv > dv) multiplier = winMult;
  else if (pv === dv) multiplier = pushMult;

  const payout = Math.floor(round.stake * multiplier);

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
      userId: round.userId, gameKey: "blackjack", stake: round.stake, payout,
      serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce,
      resultJson: JSON.stringify({ player, dealer, pv, dv }),
    },
  });

  return { player, dealer, pv, dv, payout, netDelta: payout - round.stake };
}
