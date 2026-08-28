// Mirrors registry.ts's rankValue exactly — duplicated instead of imported to avoid a circular
// import (registry.ts imports this module's hand evaluator for its Hold'em reference `play`).
const CARD_RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
function rankValue(card: string) {
  return CARD_RANKS.indexOf(card.slice(0, -1));
}

const HAND_NAMES = [
  "High card", "Pair", "Two pair", "Three of a kind", "Straight",
  "Flush", "Full house", "Four of a kind", "Straight flush",
];

function combinationsOf5(cards: string[]): string[][] {
  if (cards.length <= 5) return [cards];
  const results: string[][] = [];
  const combo: string[] = [];
  function go(start: number) {
    if (combo.length === 5) { results.push([...combo]); return; }
    for (let i = start; i < cards.length; i++) {
      combo.push(cards[i]);
      go(i + 1);
      combo.pop();
    }
  }
  go(0);
  return results;
}

function rank5(hand: string[]): number[] {
  const ranks = hand.map(rankValue).sort((a, b) => b - a);
  const suits = hand.map((c) => c.slice(-1));
  const counts: Record<number, number> = {};
  for (const r of ranks) counts[r] = (counts[r] ?? 0) + 1;
  const flush = new Set(suits).size === 1;

  const uniqueSet = new Set(ranks);
  let straightHigh: number | null = null;
  if ([12, 0, 1, 2, 3].every((r) => uniqueSet.has(r))) straightHigh = 3; // wheel: A-2-3-4-5
  for (let hi = 12; hi >= 4; hi--) {
    if ([hi, hi - 1, hi - 2, hi - 3, hi - 4].every((r) => uniqueSet.has(r))) { straightHigh = hi; break; }
  }
  const straight = straightHigh !== null;

  // Groups: each unique rank once, ordered by count desc then rank desc — this ordering doubles
  // as the correct kicker order for every pair/trips/quads case below.
  const groups = [...uniqueSet].sort((a, b) => (counts[b] - counts[a]) || (b - a));
  const groupCounts = groups.map((r) => counts[r]);

  if (straight && flush) return [8, straightHigh as number];
  if (groupCounts[0] === 4) return [7, groups[0], groups[1]];
  if (groupCounts[0] === 3 && groupCounts[1] === 2) return [6, groups[0], groups[1]];
  if (flush) return [5, ...ranks.slice(0, 5)];
  if (straight) return [4, straightHigh as number];
  if (groupCounts[0] === 3) return [3, groups[0], groups[1], groups[2]];
  if (groupCounts[0] === 2 && groupCounts[1] === 2) return [2, groups[0], groups[1], groups[2]];
  if (groupCounts[0] === 2) return [1, groups[0], groups[1], groups[2], groups[3]];
  return [0, ...ranks.slice(0, 5)];
}

/** Best 5-card hand rank out of 5-7 cards, as a lexicographically-comparable array. */
export function bestHandRank(cards: string[]): number[] {
  let best: number[] | null = null;
  for (const hand of combinationsOf5(cards)) {
    const r = rank5(hand);
    if (!best || compareRank(r, best) > 0) best = r;
  }
  return best!;
}

export function compareRank(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? -1, bv = b[i] ?? -1;
    if (av !== bv) return av - bv;
  }
  return 0;
}

export function handName(rank: number[]): string {
  return HAND_NAMES[rank[0]];
}

function preflopStrength(hole: string[]): number {
  const ranks = hole.map(rankValue).sort((a, b) => b - a);
  const suited = hole[0].slice(-1) === hole[1].slice(-1);
  let score = ranks[0] + ranks[1];
  if (ranks[0] === ranks[1]) score += 20;
  if (suited) score += 3;
  if (ranks[0] !== ranks[1] && ranks[0] - ranks[1] <= 3) score += 2;
  return score * 2; // roughly 0-88, comparable scale to postflop below
}

function handStrengthScore(hole: string[], community: string[]): number {
  if (community.length === 0) return preflopStrength(hole);
  const rank = bestHandRank([...hole, ...community]);
  return rank[0] * 12 + (rank[1] ?? 0);
}

// The bot has no real chip stack of its own (the house backs its bets), so its decisions are
// pure hand-strength heuristics with a little randomness — not a real opponent to play against
// optimally, just enough texture that folding/raising/all-in all feel like live decisions.
export function botFacingBet(hole: string[], community: string[], canRaise: boolean): "fold" | "call" | "raise" {
  const s = handStrengthScore(hole, community);
  if (s < 20) return Math.random() < 0.75 ? "fold" : "call";
  if (s < 45) return "call";
  if (canRaise && Math.random() < 0.55) return "raise";
  return "call";
}

export function botFacingCheck(hole: string[], community: string[]): "check" | "bet" {
  const s = handStrengthScore(hole, community);
  if (s >= 60) return "bet";
  if (s >= 35 && Math.random() < 0.45) return "bet";
  return "check";
}

export function botFacingAllIn(hole: string[], community: string[]): "fold" | "call" {
  return handStrengthScore(hole, community) >= 35 ? "call" : "fold";
}
