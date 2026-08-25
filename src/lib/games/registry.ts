import { randInt, shuffled } from "@/lib/fair";
import { rollUnder, spinSlots, weightedPick } from "./helpers";
import type { GameDef, GameResult } from "./types";

// Every game targets a realistic ~96% long-run RTP (4% house edge), with fixed-odds bets
// (coinflip, roulette colors) landing close to a 48% win chance per bet — a real-casino feel
// rather than a rigged one. Where a formula makes RTP independent of bet params (rollUnder,
// crash), the constant bakes the split in directly; everywhere else, multiplier tables are
// scaled to hit ~96%.
const RTP_TARGET = 0.96;

// dice/limbo share rollUnder(), which divides by targetBp — 0 breaks the formula (division by
// zero) and anything above ~9500 gives the player a near-certain win. Clamped here and enforced
// server-side via each game's validateParams so a malformed request can't hit either edge.
const MIN_TARGET_BP = 1; // 0.01% win chance floor
const MAX_TARGET_BP = 9500; // 95% win chance ceiling
function invalidTargetBp(targetBp: unknown): string | null {
  // Missing entirely (e.g. the client never sent one) is fine — play() falls back to its own
  // default. Only an explicit, out-of-range value is rejected.
  if (targetBp === undefined || targetBp === null) return null;
  const n = Number(targetBp);
  if (!Number.isFinite(n) || n < MIN_TARGET_BP || n > MAX_TARGET_BP) {
    return `targetBp must be between ${MIN_TARGET_BP} and ${MAX_TARGET_BP}`;
  }
  return null;
}

// Dice Roll's own, stricter ceiling — 80% win chance (not the shared 95% MAX_TARGET_BP, which
// Limbo also relies on for its low-target end) so the lowest possible payout is 0.96/0.8 = 1.2x,
// never the near-breakeven ~1.01x a 95% win chance produced.
const DICE_MAX_TARGET_BP = 8000;
function invalidDiceTargetBp(targetBp: unknown): string | null {
  const err = invalidTargetBp(targetBp);
  if (err) return err;
  if (targetBp !== undefined && targetBp !== null && Number(targetBp) > DICE_MAX_TARGET_BP) {
    return `targetBp must be at most ${DICE_MAX_TARGET_BP} (80% win chance)`;
  }
  return null;
}

const CARD_RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const CARD_SUITS = ["♠","♥","♦","♣"];
function freshDeck() {
  return CARD_RANKS.flatMap((r) => CARD_SUITS.map((s) => `${r}${s}`));
}
function rankValue(card: string) {
  const rank = card.slice(0, -1);
  return CARD_RANKS.indexOf(rank);
}
function blackjackValue(cards: string[]) {
  let total = 0, aces = 0;
  for (const c of cards) {
    const r = c.slice(0, -1);
    if (r === "A") { aces++; total += 11; }
    else if (["J","Q","K"].includes(r)) total += 10;
    else total += Number(r);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

const SLOT_SYMBOLS_CLASSIC = [
  { key: "7", weight: 2 }, { key: "BAR", weight: 5 }, { key: "BELL", weight: 8 },
  { key: "CHERRY", weight: 12 }, { key: "LEMON", weight: 15 },
];
// Payout values are calibrated by Monte Carlo simulation (not hand math) against this exact
// weight table, so the simulated RTP lands on the 0.96 target instead of drifting like a naive
// EV-by-hand estimate would. Re-run scratch_calibrate.ts if the weights or paytable shape change.
const SLOT_PAYTABLE_CLASSIC: Record<string, number[]> = {
  "7": [86, 270, 918], BAR: [32, 108, 367], BELL: [22, 65, 184], CHERRY: [14, 37, 92], LEMON: [9, 23, 55],
};

const SLOT_SYMBOLS_FRUITS = [
  { key: "GRAPE", weight: 3 }, { key: "WATERMELON", weight: 6 }, { key: "ORANGE", weight: 10 },
  { key: "PLUM", weight: 12 }, { key: "STAR", weight: 1 },
];
const SLOT_PAYTABLE_FRUITS: Record<string, number[]> = {
  STAR: [12.5, 41, 206], GRAPE: [4.1, 12.5, 41], WATERMELON: [2.5, 7.4, 25], ORANGE: [1.6, 4.1, 12.5], PLUM: [0.8, 2.5, 6.1],
};

export const GAMES: GameDef[] = [
  {
    key: "slots-classic", name: "Classic 777", category: "slots", minStake: 1, maxStake: 500,
    description: "Spin 3 reels. Land 3 matching symbols across the row to win — sevens pay the most, lemons the least.",
    rules: [
      "Three 7️⃣ in a row: 86x your stake",
      "Three BAR in a row: 32x your stake",
      "Three 🔔 in a row: 22x your stake",
      "Three 🍒 in a row: 14x your stake",
      "Three 🍋 in a row: 9x your stake",
      "Any non-matching row: lose your stake",
    ],
    play: (next) => spinSlots(next, SLOT_SYMBOLS_CLASSIC, 3, SLOT_PAYTABLE_CLASSIC),
  },
  {
    key: "slots-fruits", name: "Fruit Star", category: "slots", minStake: 1, maxStake: 500,
    description: "Spin 5 reels. Match 3, 4, or 5 of the same fruit for a bigger payout — the star pays the jackpot.",
    rules: [
      "★ Star: 12.5x (3 in a row) / 41x (4) / 206x (5, jackpot)",
      "🍇 Grape: 4.1x (3) / 12.5x (4) / 41x (5)",
      "🍉 Watermelon: 2.5x (3) / 7.4x (4) / 25x (5)",
      "🍊 Orange: 1.6x (3) / 4.1x (4) / 12.5x (5)",
      "🟣 Plum: 0.8x (3) / 2.5x (4) / 6.1x (5)",
      "Fewer than 3 matching symbols: lose your stake",
    ],
    play: (next) => spinSlots(next, SLOT_SYMBOLS_FRUITS, 5, SLOT_PAYTABLE_FRUITS),
  },
  {
    // minStake 5 (not 1) — at a high win-chance the payout multiplier sits just above 1.0x,
    // and whole-coin rounding on a stake of 1 floors the payout back down to the stake itself
    // (a "win" that nets 0). A stake of 5 keeps a real margin above that rounding floor.
    key: "dice", name: "Dice Roll", category: "dice", minStake: 5, maxStake: 1000,
    description: "Pick a target 1–80%. A number from 0–9999 is rolled — win if it lands under your target. Lower target, higher payout.",
    rules: [
      "Pick a win chance from 1% to 80%",
      "A number 0–9999 is rolled; you win if it lands below your chosen chance",
      "Payout on a win = 0.96 ÷ (win chance) — e.g. a 48% chance pays exactly 2x, the max 80% chance pays 1.2x",
      "Miss the roll: lose your stake",
    ],
    play: (next, params) => rollUnder(next, Number(params?.targetBp ?? 5000)),
    validateParams: (params) => invalidDiceTargetBp(params?.targetBp),
  },
  {
    key: "limbo", name: "Limbo", category: "dice", minStake: 1, maxStake: 1000,
    description: "Pick a target multiplier. A random multiplier is rolled — win if it lands at or above your target.",
    rules: [
      "Pick a target multiplier from 1.01x to 96x",
      "A random multiplier is rolled; you win if it lands at or above your target",
      "Win payout = your chosen target multiplier, applied to your stake",
      "Roll lands below your target: lose your stake",
    ],
    play: (next, params) => rollUnder(next, Number(params?.targetBp ?? 1000)),
    validateParams: (params) => invalidTargetBp(params?.targetBp),
  },
  {
    key: "coinflip", name: "Coin Flip", category: "wheel", minStake: 1, maxStake: 1000,
    description: "Call heads or tails before the flip. Guess right to win — landing on the rare edge always loses.",
    rules: [
      "Call heads or tails before the flip",
      "Correct call (48% chance each side): 2x your stake",
      "Wrong call, or the coin lands on its rare edge (4% chance): lose your stake",
    ],
    play: (next, params) => {
      const call = String(params?.call ?? "heads") === "tails" ? "tails" : "heads";
      const side = weightedPick(next, [{ weight: 48, value: "heads" }, { weight: 48, value: "tails" }, { weight: 4, value: "edge" }]);
      const win = side === call;
      // 48% chance per call side; payout scaled so 0.48 * payout == RTP_TARGET.
      const payout = Number((RTP_TARGET / 0.48).toFixed(2));
      return { multiplier: win ? payout : 0, detail: { side, call } };
    },
  },
  {
    key: "wheel", name: "Fortune Wheel", category: "wheel", minStake: 1, maxStake: 500,
    description: "Spin the wheel. 12 equal segments, alternating win/lose all the way around.",
    rules: [
      "Grey segments (0x): lose your stake — every other segment, 6 of 12",
      "Yellow segments (1x-3x): a solid win, size varies by segment — 5 of 12",
      "Red segment (10x): the one jackpot, also on a win slot",
      "Segments strictly alternate win/lose/win/lose around the wheel",
    ],
    // NOTE — RTP is no longer ~96% here: at explicit user request, x3 and x10 were set on two
    // of the equal 1-in-12 slots without rebalancing anything else. Just those two segments
    // alone already average (3+10)/12 = 108% before the other four yellow wins are even
    // counted — this wheel now pays out more than it takes in, by design, overriding the
    // platform-wide RTP_TARGET convention every other game still follows.
    play: (next) => {
      const mult = weightedPick(next, [
        { weight: 1, value: 1 }, { weight: 1, value: 0 },
        { weight: 1, value: 3 }, { weight: 1, value: 0 },
        { weight: 1, value: 1.5 }, { weight: 1, value: 0 },
        { weight: 1, value: 1.8 }, { weight: 1, value: 0 },
        { weight: 1, value: 2 }, { weight: 1, value: 0 },
        { weight: 1, value: 10 }, { weight: 1, value: 0 },
      ]);
      return { multiplier: mult, detail: { segment: mult } };
    },
  },
  {
    key: "roulette", name: "European Roulette", category: "wheel", minStake: 1, maxStake: 1000,
    description: "37-pocket wheel (0–36). Red/black and single-number bets are both scaled to the platform's fixed payout split.",
    rules: [
      "Bet red or black: win if the ball lands on that color (18/37 chance, ~48.6%) — pays 1.97x",
      "Bet green (0): win only if the ball lands on 0 (1/37 chance) — pays 35.5x",
      "Bet a single number: win only on an exact match (1/37 chance) — pays 35.5x",
      "Any other result: lose your stake",
    ],
    play: (next, params) => {
      const bet = String(params?.bet ?? "red");
      const number = randInt(next, 0, 36);
      const red = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
      const isRed = red.has(number);
      let win = false, payoutMult = 0;
      if (bet === "red" && isRed) { win = true; payoutMult = 1.97; }
      else if (bet === "black" && number !== 0 && !isRed) { win = true; payoutMult = 1.97; }
      else if (bet === "green" && number === 0) { win = true; payoutMult = 35.5; }
      else if (/^\d+$/.test(bet) && Number(bet) === number) { win = true; payoutMult = 35.5; }
      return { multiplier: win ? payoutMult : 0, detail: { number, isRed } };
    },
    validateParams: (params) => {
      const bet = String(params?.bet ?? "red");
      if (bet === "red" || bet === "black" || bet === "green") return null;
      if (/^\d+$/.test(bet) && Number(bet) >= 0 && Number(bet) <= 36) return null;
      return "bet must be red, black, green, or a number 0–36";
    },
  },
  {
    key: "mines", name: "Mines", category: "board", minStake: 1, maxStake: 500,
    description: "Pick how many mines and how many tiles to reveal. All picked tiles must be safe to win — more picks or mines means a bigger multiplier but higher risk.",
    rules: [
      "Pick how many mines are hidden (1–24) and how many tiles you'll reveal",
      "Every revealed tile must be safe — hit a single mine and you lose your stake",
      "All picks safe: payout = (1 ÷ safe-tile odds)^picks × 0.96",
      "More mines or more picks raises the multiplier and the risk together",
    ],
    play: (next, params) => {
      const mineCount = Math.min(24, Math.max(1, Number(params?.mineCount ?? 5)));
      const picks = Math.min(25 - mineCount, Math.max(1, Number(params?.picks ?? 1)));
      const grid = shuffled(next, [...Array(25)].map((_, i) => i < mineCount));
      const hitMine = grid.slice(0, picks).some(Boolean);
      const safeOdds = 1 - mineCount / 25;
      const fairMultiplier = Math.pow(1 / safeOdds, picks) * RTP_TARGET;
      return { multiplier: hitMine ? 0 : fairMultiplier, detail: { grid, picks, mineCount } };
    },
  },
  {
    key: "tower", name: "Tower Climb", category: "board", minStake: 1, maxStake: 500,
    description: "Choose how many floors to attempt. Each floor has a 75% chance to continue — the multiplier compounds the higher you climb.",
    rules: [
      "Choose how many floors to attempt (1–20)",
      "Each floor has a 75% chance to survive",
      "Falling on ANY floor loses your whole stake — no partial credit for floors already cleared",
      "Clear every chosen floor: payout = 0.96 ÷ 0.75^floors",
    ],
    play: (next, params) => {
      const floors = Math.min(20, Math.max(1, Number(params?.floors ?? 8)));
      let reached = 0;
      let survivedAll = true;
      for (let i = 0; i < floors; i++) {
        if (next() < 0.25) { survivedAll = false; break; }
        reached++;
      }
      // Bug fixed: this used to pay out based on floors survived even after a fall (e.g. reach
      // floor 2 of 5 chosen, then fall, still got paid for 2) — a guaranteed-loss-only game paid
      // out most of the time. Falling on any floor now loses the whole stake, like Mines.
      const multiplier = survivedAll ? RTP_TARGET / Math.pow(0.75, floors) : 0;
      return { multiplier, detail: { reached, floors } };
    },
  },
  {
    key: "plinko", name: "Plinko", category: "board", minStake: 1, maxStake: 500,
    description: "The ball bounces down 12 rows of pegs. Buckets near the edges pay far more than the ones in the middle.",
    rules: [
      "The ball bounces through 12 rows of pegs into one of 13 buckets",
      "Center buckets (most likely): 0.354x–0.96x",
      "Mid buckets: 1.68x–3.6x",
      "Near-edge buckets: 8.9x",
      "Outermost buckets (rarest): 43.2x",
    ],
    play: (next, params) => {
      const rows = Number(params?.rows ?? 12);
      let bucket = 0;
      for (let i = 0; i < rows; i++) bucket += next() < 0.5 ? 0 : 1;
      const mid = rows / 2;
      const dist = Math.abs(bucket - mid);
      // Indexed by distance from center: the center (most likely landing spot) pays under 1x,
      // the rare edge buckets pay the jackpot. With 12 rows every bucket's landing probability
      // is a fixed binomial(12, 0.5) weight, so this table's RTP is exactly computable — 0.354
      // (not 0.36) on the center bucket is what makes the weighted average land on 96.00% RTP
      // instead of 96.14%.
      const payouts = [0.354, 0.72, 0.96, 1.68, 3.6, 8.9, 43.2];
      const multiplier = payouts[Math.min(dist, payouts.length - 1)];
      return { multiplier, detail: { bucket, rows } };
    },
  },
  {
    key: "keno", name: "Keno", category: "board", minStake: 1, maxStake: 500,
    description: "Pick 6 numbers from 1–40. 10 numbers are drawn — match 3 or more of your picks for a payout, all 6 for the top prize.",
    rules: [
      "Pick 6 numbers from 1–40; 10 numbers are drawn",
      "0–2 matches: lose your stake",
      "3 matches: 5x · 4 matches: 10x",
      "5 matches: 40x · 6 matches (all correct): 219x",
    ],
    play: (next, params) => {
      const picksIn = Array.isArray(params?.picks) ? (params!.picks as number[]).slice(0, 6) : [1,2,3,4,5,6];
      const drawn = new Set<number>();
      while (drawn.size < 10) drawn.add(randInt(next, 1, 40));
      const hits = picksIn.filter((p) => drawn.has(p)).length;
      const table = [0, 0, 0, 5, 10, 40, 219];
      const multiplier = table[Math.min(hits, table.length - 1)] ?? 0;
      return { multiplier, detail: { drawn: [...drawn], hits, picks: picksIn } };
    },
    validateParams: (params) => {
      const picks = params?.picks;
      if (!Array.isArray(picks) || picks.length !== 6) return "picks must be exactly 6 numbers";
      const nums = picks as unknown[];
      if (!nums.every((n) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 40)) {
        return "picks must be integers between 1 and 40";
      }
      if (new Set(nums).size !== 6) return "picks must be unique";
      return null;
    },
  },
  {
    key: "hilo", name: "Hi-Lo", category: "cards", minStake: 1, maxStake: 500,
    description: "One card is shown. Guess whether the next card is higher or lower to win.",
    rules: [
      "Guess whether the next card will rank higher or lower than the shown card",
      "Correct guess: 2.04x your stake",
      "Wrong guess: lose your stake",
    ],
    play: (next, params) => {
      const guess = String(params?.guess ?? "higher");
      const deck = shuffled(next, freshDeck());
      const [current, nextCard] = deck;
      const cv = rankValue(current), nv = rankValue(nextCard);
      const win = (guess === "higher" && nv > cv) || (guess === "lower" && nv < cv);
      return { multiplier: win ? 2.04 : 0, detail: { current, nextCard } };
    },
  },
  {
    key: "blackjack", name: "Blackjack", category: "cards", minStake: 1, maxStake: 500,
    description: "You and the dealer both draw to 17. Closest to 21 without going over wins — a push refunds your stake.",
    rules: [
      "You and the dealer each draw cards until reaching 17 or more",
      "Natural blackjack (21 on your first 2 cards): 2.54x your stake",
      "Any other win (closer to 21 than the dealer, without busting): 2.03x your stake",
      "Push (equal totals): stake refunded, no win or loss",
      "Bust or dealer wins: lose your stake",
    ],
    play: (next) => {
      const deck = shuffled(next, freshDeck());
      let i = 0;
      const player = [deck[i++], deck[i++]];
      const dealer = [deck[i++], deck[i++]];
      // Bound by deck.length: with only 52 cards, running out mid-draw is a theoretical edge
      // case, not a realistic one, but this keeps the loop from reading undefined off the end.
      while (blackjackValue(player) < 17 && i < deck.length) player.push(deck[i++]);
      while (blackjackValue(dealer) < 17 && i < deck.length) dealer.push(deck[i++]);
      const pv = blackjackValue(player), dv = blackjackValue(dealer);
      let multiplier = 0;
      if (pv <= 21 && (dv > 21 || pv > dv)) multiplier = pv === 21 && player.length === 2 ? 2.54 : 2.03;
      else if (pv === dv && pv <= 21) multiplier = 1;
      return { multiplier, detail: { player, dealer, pv, dv } };
    },
  },
  {
    key: "baccarat", name: "Baccarat", category: "cards", minStake: 1, maxStake: 500,
    description: "Player and Banker each draw two cards — closest to 9 wins.",
    rules: [
      "Bet Player, Banker, or Tie before the cards are drawn",
      "Player wins and you bet Player: 2.13x your stake",
      "Banker wins and you bet Banker: 2.13x your stake",
      "Tie and you bet Tie: 9.7x your stake",
      "Wrong bet: lose your stake",
    ],
    play: (next, params) => {
      const bet = String(params?.bet ?? "player");
      const deck = shuffled(next, freshDeck());
      const val = (c: string) => Math.min(rankValue(c) + 1, 10) % 10;
      const player = [deck[0], deck[2]], banker = [deck[1], deck[3]];
      const pv = (val(player[0]) + val(player[1])) % 10;
      const bv = (val(banker[0]) + val(banker[1])) % 10;
      let winner: "player" | "banker" | "tie" = pv > bv ? "player" : bv > pv ? "banker" : "tie";
      let multiplier = 0;
      if (bet === winner) multiplier = winner === "tie" ? 9.7 : winner === "banker" ? 2.13 : 2.13;
      return { multiplier, detail: { player, banker, pv, bv, winner } };
    },
    validateParams: (params) => {
      const bet = String(params?.bet ?? "player");
      if (bet === "player" || bet === "banker" || bet === "tie") return null;
      return "bet must be player, banker, or tie";
    },
  },
  {
    key: "video-poker", name: "Poker", category: "cards", minStake: 1, maxStake: 500,
    description: "You're dealt 5 cards. A pair of 9s or better wins — the payout scales up to a big straight-flush jackpot.",
    rules: [
      "Straight flush: 144x",
      "Four of a kind: 72x",
      "Full house: 25.2x",
      "Flush: 18x",
      "Straight: 10.8x",
      "Three of a kind: 8.64x",
      "Two pair: 5.76x",
      "Pair of 9s or better: 2.88x",
      "Anything below a pair of 9s: lose your stake",
    ],
    play: (next) => {
      const deck = shuffled(next, freshDeck());
      const hand = deck.slice(0, 5);
      const ranks = hand.map(rankValue).sort((a, b) => a - b);
      const suits = hand.map((c) => c.slice(-1));
      const counts: Record<number, number> = {};
      for (const r of ranks) counts[r] = (counts[r] ?? 0) + 1;
      const groups = Object.values(counts).sort((a, b) => b - a);
      const flush = new Set(suits).size === 1;
      const straight = ranks.every((r, idx) => idx === 0 || r === ranks[idx - 1] + 1);
      let multiplier = 0;
      if (straight && flush) multiplier = 144;
      else if (groups[0] === 4) multiplier = 72;
      else if (groups[0] === 3 && groups[1] === 2) multiplier = 25.2;
      else if (flush) multiplier = 18;
      else if (straight) multiplier = 10.8;
      else if (groups[0] === 3) multiplier = 8.64;
      else if (groups[0] === 2 && groups[1] === 2) multiplier = 5.76;
      else if (groups[0] === 2 && ranks.some((r) => counts[r] === 2 && r >= 9)) multiplier = 2.88;
      return { multiplier, detail: { hand } };
    },
  },
  {
    key: "crash", name: "Crash", category: "crash", minStake: 1, maxStake: 1000,
    description: "The multiplier climbs until it crashes. Your cashout is fixed at 2x — if the crash point lands past it, you win.",
    rules: [
      "The multiplier climbs from 1x until it randomly crashes",
      "Your cashout target is fixed at 2x",
      "Crash point lands at or above 2x (20% chance): win 2x your stake",
      "Crash point lands below 2x: lose your stake",
    ],
    play: (next, params) => {
      const cashoutAt = Number(params?.cashoutAt ?? 2);
      const r = next();
      // Crash-point formula: P(crashPoint >= target) = RTP_TARGET/target, so EV = RTP_TARGET
      // for any fixed cashout target — the platform's payout split holds regardless of target.
      const crashPoint = Math.max(1, RTP_TARGET / (1 - r));
      const win = cashoutAt <= crashPoint;
      return { multiplier: win ? cashoutAt : 0, detail: { crashPoint: Number(crashPoint.toFixed(2)) } };
    },
    validateParams: (params) => {
      const cashoutAt = Number(params?.cashoutAt ?? 2);
      if (!Number.isFinite(cashoutAt) || cashoutAt <= 1 || cashoutAt > 1000) {
        return "cashoutAt must be a number greater than 1 and at most 1000";
      }
      return null;
    },
  },
];

export function getGame(key: string): GameDef | undefined {
  return GAMES.find((g) => g.key === key);
}

export type { GameResult };
