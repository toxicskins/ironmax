import { randInt, shuffled } from "@/lib/fair";
import { rollUnder, spinSlots, weightedPick } from "./helpers";
import { bestHandRank, compareRank, handName } from "./holdem";
import type { GameDef, GameResult } from "./types";

// Every game targets a realistic ~96% long-run RTP (4% house edge), with fixed-odds bets
// (coinflip, roulette colors) landing close to a 48% win chance per bet — a real-casino feel
// rather than a rigged one. Where a formula makes RTP independent of bet params (rollUnder),
// the constant bakes the split in directly; everywhere else, multiplier tables are scaled to
// hit ~96%.
export const RTP_TARGET = 0.96;

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

const CARD_RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const CARD_SUITS = ["♠","♥","♦","♣"];
export function freshDeck() {
  return CARD_RANKS.flatMap((r) => CARD_SUITS.map((s) => `${r}${s}`));
}
export function rankValue(card: string) {
  const rank = card.slice(0, -1);
  return CARD_RANKS.indexOf(rank);
}
// Baccarat's own card values: A=1, 2-9 face value, 10/J/Q/K=0 — distinct from rankValue (a plain
// deck-order index used for high-card comparisons elsewhere), which doesn't map to these at all.
function baccaratCardValue(card: string) {
  const rank = card.slice(0, -1);
  if (rank === "A") return 1;
  if (rank === "10" || rank === "J" || rank === "Q" || rank === "K") return 0;
  return Number(rank);
}
function baccaratTotal(cards: string[]) {
  return cards.reduce((s, c) => s + baccaratCardValue(c), 0) % 10;
}
/** The first 4 cards of a shuffled deck, dealt into Player/Banker's starting hands. Split out
 * from the tableau so the interactive flow can show Player's hand before Banker's is resolved. */
export function dealBaccaratInitial(deck: string[]) {
  return { player: [deck[0], deck[1]], banker: [deck[2], deck[3]] };
}
/** Compares the two already-dealt 2-card hands directly — no 3rd-card draw, so every hand is
 * exactly 2 cards a side, like a simplified baccarat variant rather than the full casino tableau. */
export function resolveBaccaratTableau(deck: string[], initialPlayer: string[], initialBanker: string[]) {
  const player = [...initialPlayer], banker = [...initialBanker];
  const pv = baccaratTotal(player), bv = baccaratTotal(banker);
  const winner: "player" | "banker" | "tie" = pv > bv ? "player" : bv > pv ? "banker" : "tie";
  return { player, banker, pv, bv, winner };
}
function playBaccaratHand(deck: string[]) {
  const { player, banker } = dealBaccaratInitial(deck);
  return resolveBaccaratTableau(deck, player, banker);
}
export function blackjackValue(cards: string[]) {
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

// The 9-symbol set from the game's poster art, rarest paying the most, like a real scratch card.
// Payouts scaled by Monte Carlo simulation (8M draws) against this exact weight table to land
// on the 0.96 RTP target — re-simulate if the weights or pay values change.
const SCRATCH_SYMBOLS = [
  { weight: 25, value: { key: "CLOVER", pay: 2.23 } },
  { weight: 20, value: { key: "CHERRIES", pay: 3.25 } },
  { weight: 16, value: { key: "BELL", pay: 5.28 } },
  { weight: 13, value: { key: "GOLDBAR", pay: 8.53 } },
  { weight: 10, value: { key: "PLUM", pay: 14.2 } },
  { weight: 7, value: { key: "SEVEN", pay: 24.4 } },
  { weight: 5, value: { key: "STAR", pay: 40.6 } },
  { weight: 3, value: { key: "CROWN", pay: 91.4 } },
  { weight: 1, value: { key: "DIAMOND", pay: 182.7 } },
];
const SCRATCH_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const SIC_BO_BETS = new Set(["small", "big", "odd", "even", "any-triple", "triple"]);

// 5x5 bingo card positions (0-24), all 12 winning lines: 5 rows, 5 columns, 2 diagonals.
const BINGO_LINES = [
  ...[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c)),
  ...[0, 1, 2, 3, 4].map((c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

// Weighted so each marker's own multiplier lands on 0.96 RTP: mult_i = 0.96 * totalWeight / weight_i.
const TANK_ZONES = [
  { weight: 40, value: 0 }, { weight: 30, value: 1 }, { weight: 15, value: 2 },
  { weight: 10, value: 3 }, { weight: 5, value: 4 },
];
const TANK_MULT = [2.4, 3.2, 6.4, 9.6, 19.2];

// Weights/values solved together for ~0.96 EV: (0*61 + 1*25 + 2*9 + 6*4 + 30*1) / 100 = 0.97.
const GOLDEN_TICKET_PRIZES = [
  { weight: 61, value: 0 }, { weight: 25, value: 1 }, { weight: 9, value: 2 },
  { weight: 4, value: 6 }, { weight: 1, value: 30 },
];
// The 2x-or-better slice of GOLDEN_TICKET_PRIZES, same relative odds — used to force one decoy
// into a "real win" tier when a spread would otherwise show nothing above 1x.
const GOLDEN_TICKET_BIG_PRIZES = [
  { weight: 9, value: 2 }, { weight: 4, value: 6 }, { weight: 1, value: 30 },
];

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
    description: "37-pocket wheel (0–36). Bet red, black, or green — no single-number bets.",
    rules: [
      "Bet red or black: win if the ball lands on that color (18/37 chance, ~48.6%) — pays 2x",
      "Bet green (0): win only if the ball lands on 0 (1/37 chance) — pays 35.5x",
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
      return { multiplier: win ? payoutMult : 0, detail: { number, isRed } };
    },
    validateParams: (params) => {
      const bet = String(params?.bet ?? "red");
      if (bet === "red" || bet === "black" || bet === "green") return null;
      return "bet must be red, black, or green";
    },
  },
  {
    key: "mines", name: "Mines", category: "board", minStake: 1, maxStake: 500,
    description: "Choose how many mines are hidden, then click tiles yourself one at a time. Cash out whenever you want — the longer you push your luck, the bigger the multiplier.",
    rules: [
      "Pick how many mines are hidden (1–24), then click any tile on the 5×5 board to reveal it",
      "Every safe tile you reveal raises your multiplier — cash out any time after your first pick",
      "Hit a mine and you lose your stake, whatever you'd built up",
      "Multiplier per safe pick = (1 ÷ safe-tile odds)^picks × 0.96",
    ],
    // This entry's `play` is unused for actual bets now — Mines is interactive (pick tiles one
    // at a time, cash out whenever) via /api/games/mines/{start,pick,cashout}, which need the
    // mine layout to persist server-side between requests instead of resolving in one shot like
    // every other game here. Kept for the min/max stake + rules text the game page reads, and
    // as the reference formula the API routes reimplement.
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
    description: "Climb an 8-floor tower one tile at a time. Pick the safe tile on each floor — cash out any time, or fall and lose it all.",
    rules: [
      "Pick a difficulty: each sets how many tiles are on a floor and how many are safe",
      "Pick one tile per floor — a safe tile lets you climb to the next floor and raises your multiplier",
      "Cash out any time after your first climb, or keep going for a bigger multiplier",
      "Pick a bomb tile and you lose your stake, whatever you'd built up",
      "Multiplier per floor climbed = (tiles per floor ÷ safe tiles)^floors × 0.96",
    ],
    // This entry's `play` is unused for actual bets — Tower Climb is interactive (pick one tile
    // per floor, cash out whenever) via /api/games/tower/{start,pick,cashout}, which need the
    // per-floor bomb layout to persist server-side between requests instead of resolving in one
    // shot like every other game here. Kept for the min/max stake + rules text the page reads.
    play: (next, params) => {
      const tilesPerRow = Math.min(4, Math.max(2, Number(params?.tilesPerRow ?? 3)));
      const safeTiles = Math.min(tilesPerRow - 1, Math.max(1, Number(params?.safeTiles ?? 2)));
      const floors = Math.min(8, Math.max(1, Number(params?.floors ?? 4)));
      let reached = 0;
      let survivedAll = true;
      for (let i = 0; i < floors; i++) {
        if (next() >= safeTiles / tilesPerRow) { survivedAll = false; break; }
        reached++;
      }
      const fairMultiplier = Math.pow(tilesPerRow / safeTiles, floors) * RTP_TARGET;
      return { multiplier: survivedAll ? fairMultiplier : 0, detail: { reached, floors } };
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
    description: "The current card is shown first — then you call higher or lower on what you see, not before.",
    rules: [
      "The current card is dealt and shown before you guess anything",
      "Guess whether the next card will rank higher or lower than it",
      "Correct guess: 2.04x your stake",
      "Tie (same rank) or wrong guess: lose your stake",
    ],
    // This entry's `play` is unused for actual bets — Hi-Lo is interactive (see the shown card,
    // then guess) via /api/games/hilo/{start,pick}, which need the current card to persist
    // server-side between requests instead of resolving in one shot like every other game here.
    play: (next, params) => {
      const guess = String(params?.guess ?? "higher");
      const deck = shuffled(next, freshDeck());
      const [current, nextCard] = deck;
      const cv = rankValue(current), nv = rankValue(nextCard);
      const win = (guess === "higher" && nv > cv) || (guess === "lower" && nv < cv);
      return { multiplier: win ? 2.04 : 0, detail: { current, nextCard, guess } };
    },
  },
  {
    key: "blackjack", name: "Blackjack", category: "cards", minStake: 1, maxStake: 500,
    description: "Real hand-by-hand blackjack. You're dealt 2 cards and choose Hit, Stand, or Double — the dealer plays after you stand.",
    rules: [
      "Hit to take another card, Stand to lock in your total and let the dealer play",
      "Double (first move only): match your stake, take exactly one more card, then stand",
      "Natural blackjack (21 on your first 2 cards): pays 2.5x your stake",
      "Any other win (closer to 21 than the dealer, without busting): pays 2x your stake",
      "Push (equal totals): stake refunded, no win or loss",
      "Bust (over 21), or the dealer's total beats yours: lose your stake",
      "Dealer draws to 17 and stands — same rule the house plays by",
    ],
    // This entry's `play` is unused for actual bets — Blackjack is interactive (Hit/Stand/Double,
    // one card at a time) via /api/games/blackjack/{start,hit,stand,double}, which need the hand
    // to persist server-side between requests instead of resolving in one shot like every other
    // game here. Kept for the min/max stake + rules text the game page reads.
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
    description: "You see your own 2 cards first — the Banker's stay face down until after you've placed your bet.",
    rules: [
      "Goal: guess which side — Player or Banker — ends up closer to 9",
      "Card totals drop the tens digit: 4+8=12 counts as 2, 3+9+8=20 counts as 0",
      "Your 2 cards are dealt and shown first; the Banker's 2 stay hidden until you bet",
      "Bet Player, Banker, or Tie, then both hands are revealed and resolved",
      "Every hand is exactly 2 cards a side — no 3rd-card draw",
      "Player wins and you bet Player: 2.13x your stake",
      "Banker wins and you bet Banker: 2.13x your stake",
      "Tie and you bet Tie: 9.7x your stake",
      "Wrong bet: lose your stake",
    ],
    // This entry's `play` is unused for actual bets — Baccarat is interactive (your 2 cards are
    // shown before the Banker's, then you bet) via /api/games/baccarat/{start,pick}, which need
    // the dealt-but-hidden Banker hand to persist server-side between requests instead of
    // resolving in one shot like every other game here.
    play: (next, params) => {
      const bet = String(params?.bet ?? "player");
      const deck = shuffled(next, freshDeck());
      const hand = playBaccaratHand(deck);
      let multiplier = 0;
      if (bet === hand.winner) multiplier = hand.winner === "tie" ? 9.7 : 2.13;
      return { multiplier, detail: { ...hand } };
    },
    validateParams: (params) => {
      const bet = String(params?.bet ?? "player");
      if (bet === "player" || bet === "banker" || bet === "tie") return null;
      return "bet must be player, banker, or tie";
    },
  },
  {
    key: "video-poker", name: "Texas Hold'em", category: "cards", minStake: 1, maxStake: 500,
    description: "Heads-up against the house bot. You each get 2 hole cards, then 5 community cards come out in the middle — bet, call, raise, or go all-in across four streets.",
    rules: [
      "You and the bot each get 2 hole cards, face down",
      "5 community cards are dealt to the middle in stages: flop (3), turn (1), river (1)",
      "After each stage, bet: check or bet if nothing's owed, call or raise if the bot bet, or go all-in anytime",
      "Fold to give up the hand and whatever you've put in the pot",
      "If both players are still in after the river, best 5-card hand from your 2 + the 5 community cards wins the pot",
      "Going all-in skips straight to showing every remaining community card at once",
    ],
    // This entry's `play` is unused for actual bets — Hold'em is fully interactive (hole cards,
    // then a full betting round after every community-card stage) via
    // /api/games/video-poker/{start,action}, which need the deck, both hands, and the pot to
    // persist server-side across many requests instead of resolving in one shot like every other
    // game here. Kept only as a rough reference: one no-betting hand dealt straight to showdown.
    play: (next) => {
      const deck = shuffled(next, freshDeck());
      const player = deck.slice(0, 2);
      const bot = deck.slice(2, 4);
      const community = deck.slice(4, 9);
      const playerRank = bestHandRank([...player, ...community]);
      const botRank = bestHandRank([...bot, ...community]);
      const cmp = compareRank(playerRank, botRank);
      const multiplier = cmp > 0 ? 2 : cmp === 0 ? 1 : 0;
      return { multiplier, detail: { player, bot, community, combo: handName(playerRank) } };
    },
  },
  {
    key: "sic-bo", name: "Dice Roll", category: "dice", minStake: 1, maxStake: 500,
    description: "Three dice roll. Pick a bet — Small/Big, Odd/Even, or call a specific triple for a long-shot jackpot.",
    rules: [
      "Small (4-10) or Big (11-17): win 2x — any triple busts both",
      "Odd or Even total: win 2x — any triple busts both",
      "Any triple (three of a kind, any number): win 34.5x",
      "A specific triple you call (e.g. all 4s): win 207x",
      "Bet condition not met: lose your stake",
    ],
    // Genuinely random combinatorics (216 outcomes of 3d6), not a hand-tuned probability —
    // each bet's payout is 0.96 / (its real win chance), so the RTP falls out of the dice math.
    play: (next, params) => {
      const bet = SIC_BO_BETS.has(String(params?.bet)) ? String(params?.bet) : "small";
      const number = Number(params?.number ?? 1);
      const dice = [randInt(next, 1, 6), randInt(next, 1, 6), randInt(next, 1, 6)];
      const sum = dice[0] + dice[1] + dice[2];
      const isTriple = dice[0] === dice[1] && dice[1] === dice[2];
      let win = false;
      let multiplier = 0;
      if (bet === "small") { win = !isTriple && sum >= 4 && sum <= 10; multiplier = 2; }
      else if (bet === "big") { win = !isTriple && sum >= 11 && sum <= 17; multiplier = 2; }
      else if (bet === "odd") { win = !isTriple && sum % 2 === 1; multiplier = 2; }
      else if (bet === "even") { win = !isTriple && sum % 2 === 0; multiplier = 2; }
      else if (bet === "any-triple") { win = isTriple; multiplier = 34.5; }
      else if (bet === "triple") { win = isTriple && dice[0] === number; multiplier = 207; }
      return { multiplier: win ? multiplier : 0, detail: { dice, sum, bet, number: bet === "triple" ? number : undefined, isTriple } };
    },
    validateParams: (params) => {
      const bet = String(params?.bet ?? "small");
      if (params?.bet !== undefined && !SIC_BO_BETS.has(bet)) {
        return `bet must be one of: ${[...SIC_BO_BETS].join(", ")}`;
      }
      if (bet === "triple") {
        const number = Number(params?.number ?? 1);
        if (!Number.isInteger(number) || number < 1 || number > 6) return "number must be an integer from 1 to 6";
      }
      return null;
    },
  },
  {
    key: "scratch-gold", name: "Scratch Gold", category: "board", minStake: 1, maxStake: 500,
    description: "Reveal a 3x3 grid. Three matching symbols in any row, column, or diagonal pays out — rarer symbols pay more.",
    rules: [
      "Three 💎 Diamond in a line: 182.7x",
      "Three 👑 Crown in a line: 91.4x",
      "Three ★ Star in a line: 40.6x",
      "Three 7️⃣ Seven in a line: 24.4x",
      "Three 🍇 Plum in a line: 14.2x",
      "Three 🟨 Gold Bar in a line: 8.53x",
      "Three 🔔 Bell in a line: 5.28x",
      "Three 🍒 Cherries in a line: 3.25x",
      "Three 🍀 Clover in a line: 2.23x",
      "No line of 3 matching symbols: lose your stake",
      "Multiple winning lines: paid at the best one",
    ],
    play: (next) => {
      const cells = Array.from({ length: 9 }, () => weightedPick(next, SCRATCH_SYMBOLS));
      let multiplier = 0;
      let winLine: number[] | null = null;
      for (const line of SCRATCH_LINES) {
        const [a, b, c] = line;
        if (cells[a].key === cells[b].key && cells[b].key === cells[c].key && cells[a].pay > multiplier) {
          multiplier = cells[a].pay;
          winLine = line;
        }
      }
      return { multiplier, detail: { cells: cells.map((s) => s.key), winLine } };
    },
  },
  {
    key: "memory-flip", name: "Twin Flip", category: "cards", minStake: 1, maxStake: 500,
    description: "8 cards face down, 4 hidden pairs. Pick 2 cards in the game itself — match them and win.",
    rules: [
      "Pick any 2 of the 8 face-down cards to flip",
      "Your 2 cards turn out to be a matching pair (1-in-7 chance): win 6.72x",
      "No match: lose your stake",
    ],
    // Which 2 of the 8 cards you flip is chosen in the game itself, after the bet has already
    // resolved (like Golden Ticket) — so the server only needs to decide win/lose here, matching
    // the same 1-in-7 odds a real 2-of-8 pair pick has. The board's actual pair layout is built
    // client-side once you've picked, arranging itself around your 2 picks.
    play: (next) => {
      const matched = next() < 1 / 7;
      return { multiplier: matched ? 6.72 : 0, detail: { matched } };
    },
  },
  {
    key: "bingo", name: "Bingo", category: "board", minStake: 1, maxStake: 500,
    description: "A 5x5 card, 13 of its 25 numbers get called. Complete any row, column, or diagonal to win.",
    rules: [
      "13 of the 25 numbers on your card are called",
      "Any complete row, column, or diagonal of called numbers: win 3.52x",
      "No completed line: lose your stake",
    ],
    play: (next) => {
      // Real bingo cards don't run 1-25 in reading order — each of the 5 columns draws its own
      // numbers from a fixed range (B 1-15, I 16-30, N 31-45, G 46-60, O 61-75), shuffled
      // independently, so the printed numbers land in a different spot on every card.
      const cardNumbers = new Array(25).fill(0);
      for (let col = 0; col < 5; col++) {
        const range = shuffled(next, Array.from({ length: 15 }, (_, i) => col * 15 + i + 1));
        for (let row = 0; row < 5; row++) cardNumbers[row * 5 + col] = range[row];
      }
      const cardPositions = shuffled(next, Array.from({ length: 25 }, (_, i) => i));
      const called = new Set(cardPositions.slice(0, 13));
      const winLine = BINGO_LINES.find((line) => line.every((p) => called.has(p))) ?? null;
      return { multiplier: winLine ? 3.52 : 0, detail: { called: [...called], winLine, cardNumbers } };
    },
  },
  {
    key: "tank-shot", name: "Tank Shot", category: "dice", minStake: 1, maxStake: 500,
    description: "Aim your tank at one of 5 distance markers and fire. Land there and win — farther markers pay much more.",
    rules: [
      "Marker 1 (closest, most likely): win 2.4x",
      "Marker 2: win 3.2x",
      "Marker 3: win 6.4x",
      "Marker 4: win 9.6x",
      "Marker 5 (farthest, longest shot): win 19.2x",
      "The shell lands on a different marker: lose your stake",
    ],
    play: (next, params) => {
      const target = Math.min(4, Math.max(0, Number(params?.target ?? 0)));
      const landed = weightedPick(next, TANK_ZONES);
      const win = landed === target;
      return { multiplier: win ? TANK_MULT[target] : 0, detail: { landed, target } };
    },
    validateParams: (params) => {
      const t = Number(params?.target ?? 0);
      if (!Number.isInteger(t) || t < 0 || t > 4) return "target must be an integer 0-4";
      return null;
    },
  },
  {
    key: "golden-ticket", name: "Golden Ticket", category: "board", minStake: 1, maxStake: 500,
    description: "5 tickets, face down — you pick which one to open. Whatever prize is underneath is your payout.",
    rules: [
      "1x: common small win",
      "2x: a solid win",
      "6x: a rare bigger win",
      "30x: the jackpot ticket",
      "Blank ticket: lose your stake",
      "Only your chosen ticket pays — the other 4 shown afterward are for curiosity, not extra winnings",
    ],
    play: (next) => {
      const prize = weightedPick(next, GOLDEN_TICKET_PRIZES);
      // 4 cosmetic tickets shown alongside the real one once you've picked, so you can see what
      // the other 4 would have held — decorative only, they never change your payout.
      const decoys = Array.from({ length: 4 }, () => weightedPick(next, GOLDEN_TICKET_PRIZES));
      // Every spread shows at least one 2x-or-better ticket somewhere among the 5 — if the real
      // draws didn't happen to land one, force a random decoy slot to a big cosmetic prize so the
      // pile never reads as a total dud before you've even picked.
      if (prize < 2 && decoys.every((d) => d < 2)) {
        decoys[randInt(next, 0, decoys.length - 1)] = weightedPick(next, GOLDEN_TICKET_BIG_PRIZES);
      }
      return { multiplier: prize, detail: { prize, decoys } };
    },
  },
];

export function getGame(key: string): GameDef | undefined {
  return GAMES.find((g) => g.key === key);
}

export type { GameResult };
