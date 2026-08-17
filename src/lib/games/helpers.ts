import { randInt } from "@/lib/fair";
import type { GameResult } from "./types";

/** Weighted-outcome table shared by coinflip, wheel, roulette-style games. */
export function weightedPick<T>(next: () => number, table: { weight: number; value: T }[]): T {
  const total = table.reduce((s, t) => s + t.weight, 0);
  let r = next() * total;
  for (const t of table) {
    if (r < t.weight) return t.value;
    r -= t.weight;
  }
  return table[table.length - 1].value;
}

/** Slot machine: spin `reelCount` reels of `symbols`, pay by matching-run length via `paytable`. */
export function spinSlots(
  next: () => number,
  symbols: { key: string; weight: number }[],
  reelCount: number,
  paytable: Record<string, number[]> // symbol -> [pay for 3-match, 4-match, 5-match...] indexed by (matchCount-3)
): GameResult {
  const reels = Array.from({ length: reelCount }, () =>
    weightedPick(next, symbols.map((s) => ({ weight: s.weight, value: s.key })))
  );
  const counts: Record<string, number> = {};
  for (const s of reels) counts[s] = (counts[s] ?? 0) + 1;
  let multiplier = 0;
  for (const [sym, count] of Object.entries(counts)) {
    if (count >= 3 && paytable[sym]) {
      multiplier = Math.max(multiplier, paytable[sym][count - 3] ?? 0);
    }
  }
  return { multiplier, detail: { reels } };
}

/**
 * "Roll a number 0-9999 and win if it lands under target" — backs dice and limbo.
 * houseEdgeBp fixes long-run RTP at (10000-houseEdgeBp)/10000 regardless of target,
 * since fairMultiplier * targetBp/10000 == 1. Default 400bp -> 96% RTP (4% house edge),
 * a realistic casino edge — callers should still clamp targetBp themselves (see
 * registry.ts's dice/limbo validateParams) since a targetBp of 0 or 10000 breaks the formula.
 */
export function rollUnder(next: () => number, targetBp: number, houseEdgeBp = 400): GameResult {
  const roll = randInt(next, 0, 9999);
  const win = roll < targetBp;
  const fairMultiplier = 10000 / targetBp;
  const multiplier = win ? (fairMultiplier * (10000 - houseEdgeBp)) / 10000 : 0;
  return { multiplier, detail: { roll, targetBp } };
}
