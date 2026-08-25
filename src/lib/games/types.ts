export type GameResult = {
  multiplier: number; // payout = floor(stake * multiplier)
  detail: Record<string, unknown>; // game-specific info for the UI (reels, dice roll, cards...)
};

export type GameDef = {
  key: string;
  name: string;
  category: "slots" | "dice" | "cards" | "wheel" | "board";
  minStake: number;
  maxStake: number;
  /** Shown to the player on the game page — how to read the table and what wins. */
  description: string;
  /** Bullet list of exact win conditions and payouts, shown under the description. */
  rules: string[];
  /** Pure function of the shared RNG stream -> outcome. No side effects, no DB access. */
  play: (next: () => number, params?: Record<string, unknown>) => GameResult;
  /** Rejects params that make a bet unwinnable or exploit the payout formula (e.g. a targetBp
   * of 0, an out-of-range roulette number). Returns an error message, or null if params are fine. */
  validateParams?: (params?: Record<string, unknown>) => string | null;
};
