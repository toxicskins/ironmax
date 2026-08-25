"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as deck from "@letele/playing-cards";
import {
  IconSeven, IconBar, IconBell, IconCherry, IconLemon, IconGrape,
  IconWatermelon, IconOrange, IconPlum, IconStar, IconMine, IconGem, IconCoinFace,
  IconEagle, IconLaurelStar,
} from "./icons";

const SYMBOL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "7": IconSeven, BAR: IconBar, BELL: IconBell, CHERRY: IconCherry, LEMON: IconLemon,
  GRAPE: IconGrape, WATERMELON: IconWatermelon, ORANGE: IconOrange, PLUM: IconPlum, STAR: IconStar,
};

// Memory Flip's 4 pair labels (A-D, from the server) mapped to distinct icons for display —
// the label itself is just an internal pair id, never shown as text.
const MEMORY_PAIR_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  A: IconCherry, B: IconLemon, C: IconBell, D: IconBar,
};

// @letele/playing-cards names cards as <SuitLetter><rankLetter>, e.g. "Sk" = King of Spades.
const SUIT_LETTER: Record<string, string> = { "♠": "S", "♥": "H", "♦": "D", "♣": "C" };
const RANK_LETTER: Record<string, string> = { J: "j", Q: "q", K: "k", A: "a" };

// A card slides in from above while it flips — reads as being dealt off the top of the deck
// rather than just fading into place. `delay` overrides the index-based default so callers that
// deal cards in a specific real-world order (e.g. blackjack alternating player/dealer) can pace
// each card explicitly instead of everything in a row landing on the same stagger.
function Card({ card, index, resultKey, delay }: { card: string; index: number; resultKey: string; delay?: number }) {
  const suit = card.slice(-1);
  const rank = card.slice(0, -1);
  const name = `${SUIT_LETTER[suit] ?? "S"}${RANK_LETTER[rank] ?? rank}`;
  const Face = (deck as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[name];
  if (!Face) return null;
  return (
    <motion.div
      key={`${resultKey}-${index}`}
      className="w-16 h-[90px] sm:w-28 sm:h-[157px] lg:w-36 lg:h-[201px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
      style={{ perspective: 400 }}
      initial={{ rotateY: 180, opacity: 0, y: -24 }}
      animate={{ rotateY: 0, opacity: 1, y: 0 }}
      transition={{ delay: delay ?? index * 0.15, duration: 0.35, ease: "easeOut" }}
    >
      <Face style={{ width: "100%", height: "100%" }} />
    </motion.div>
  );
}

export function CardBack({ index, delay }: { index: number; delay?: number }) {
  return (
    <motion.div
      className="w-16 h-[90px] sm:w-28 sm:h-[157px] lg:w-36 lg:h-[201px] rounded-lg bg-gradient-to-br from-indigo-900 to-zinc-950 border-2 border-indigo-500/30 shadow-[0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center"
      initial={{ rotateY: 180, opacity: 0, y: -24 }}
      animate={{ rotateY: 0, opacity: 1, y: 0 }}
      transition={{ delay: delay ?? index * 0.15, duration: 0.35, ease: "easeOut" }}
    >
      <div className="w-8 h-8 rounded-full border-2 border-indigo-400/40" />
    </motion.div>
  );
}

export function CardRow({ cards, resultKey, delays }: { cards: string[]; resultKey: string; delays?: number[] }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
      {cards.map((c, i) => <Card key={i} card={c} index={i} resultKey={resultKey} delay={delays?.[i]} />)}
    </div>
  );
}

const ALL_SLOT_SYMBOLS = Object.keys(SYMBOL_ICON);

// Mirrors the video-poker combo/multiplier list in registry.ts exactly, highest first — shown as
// a mini paytable under every hand so the payout for whatever you just landed (or missed) is
// visible in place, not just in the collapsed rules list.
const POKER_PAYTABLE: [string, number][] = [
  ["Straight flush", 144],
  ["Four of a kind", 72],
  ["Full house", 25.2],
  ["Flush", 18],
  ["Straight", 10.8],
  ["Three of a kind", 8.64],
  ["Two pair", 5.76],
  ["Pair of 9s or better", 2.88],
];

/** Counts up to `value` starting `delay` seconds after mount — makes a hand total feel tallied, not just printed. */
function CountUp({ value, delay, resultKey }: { value: number; delay: number; resultKey: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const steps = Math.max(value, 1);
    const stepMs = 350 / steps;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let s = 1; s <= steps; s++) {
      timers.push(setTimeout(() => { if (!cancelled) setShown(s); }, delay * 1000 + s * stepMs));
    }
    return () => { cancelled = true; timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey, value]);
  return <span>{shown}</span>;
}

const DIE_PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
};
function Die({ value, resultKey, index }: { value: number; resultKey: string; index: number }) {
  return (
    <motion.div
      key={`${resultKey}-${index}`}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
      initial={{ rotate: -180, scale: 0.4, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {DIE_PIPS[value]?.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="8" fill="#18181b" />)}
      </svg>
    </motion.div>
  );
}

// A spread of 5 face-down tickets. Only the player's click decides which one opens — there is no
// timeout or auto-pick, since the whole point is that it's their choice. Once picked, ALL 5
// flip so you can see what the other 4 held too, but only the one you picked ever paid: the
// other 4 values are cosmetic decoys from the server, not a "what you missed" of real money.
const GOLDEN_TICKET_COUNT = 5;
function GoldenTicketPile({ prize, decoys, resultKey, onRevealed }: {
  prize: number; decoys: number[]; resultKey: string; onRevealed?: () => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  useEffect(() => setChosen(null), [resultKey]);

  // The real prize always lands on whichever card was actually clicked — the other 4 slots get
  // the decoys, in order. Computed from `chosen`, not a separate random slot, so "yours" can
  // never point at a different card than the one the player picked.
  const arr = useMemo(() => {
    if (chosen === null) return null;
    const a = [...decoys];
    a.splice(chosen, 0, prize);
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen, resultKey]);

  const revealDelay = 0.15;
  const flipDuration = 0.5;

  function pick(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    setTimeout(() => onRevealed?.(), (revealDelay + flipDuration) * 1000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.p
        initial={{ opacity: 1 }}
        animate={{ opacity: chosen === null ? 1 : 0 }}
        className="text-sm text-zinc-400 h-5"
      >
        Pick a ticket to scratch
      </motion.p>
      <div className="flex gap-2 sm:gap-3">
        {Array.from({ length: GOLDEN_TICKET_COUNT }, (_, i) => {
          const isChosen = chosen === i;
          const value = arr ? arr[i] : 0;
          const won = value > 0;
          return (
            <div key={i} className="relative w-16 h-24 sm:w-20 sm:h-28" style={{ perspective: 600 }}>
              <motion.button
                type="button"
                disabled={chosen !== null}
                onClick={() => pick(i)}
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d", cursor: chosen === null ? "pointer" : "default" }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: chosen !== null ? 180 : 0 }}
                whileHover={chosen === null ? { y: -4 } : undefined}
                whileTap={chosen === null ? { scale: 0.95 } : undefined}
                transition={{ delay: isChosen ? revealDelay : chosen !== null ? revealDelay + 0.1 : 0, duration: flipDuration, ease: "easeIn" }}
              >
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-300 flex items-center justify-center text-amber-950 text-3xl shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  ★
                </div>
                <div
                  className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-extrabold ${
                    isChosen ? "ring-2 ring-amber-400" : ""
                  } ${won ? "bg-zinc-950 border-emerald-400 text-emerald-400" : "bg-zinc-950 border-zinc-700 text-zinc-500"}`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {value}x
                </div>
              </motion.button>
              {chosen !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: revealDelay + flipDuration }}
                  className={`absolute -bottom-4 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-wide ${
                    isChosen ? "text-amber-400" : "text-zinc-600"
                  }`}
                >
                  {isChosen ? "yours" : ""}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      {chosen !== null && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: revealDelay + flipDuration + 0.3 }}
          className="text-sm text-zinc-400 mt-2"
        >
          {prize > 0 ? "Your ticket paid out!" : "Your ticket was blank — no win"}
        </motion.p>
      )}
    </div>
  );
}

function shuffleClient<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 8 face-down cards, no board layout until the player has picked 2 — the win/lose outcome is
// already decided server-side (a plain 1-in-7 chance, matching a real 2-of-8 pair pick), but
// which 2 cards form the "matching" pair only gets assigned once you've actually chosen them, so
// the pair you flip is always the one you picked, never a fixed board you're just clicking into.
const TWIN_FLIP_LABELS = ["A", "B", "C", "D"];
function TwinFlipBoard({ matched, resultKey, onRevealed }: {
  matched: boolean; resultKey: string; onRevealed?: () => void;
}) {
  const [picks, setPicks] = useState<number[]>([]);
  useEffect(() => setPicks([]), [resultKey]);

  const labels = useMemo(() => {
    if (picks.length < 2) return null;
    const [a, b] = picks;
    const arr = new Array<string>(8);
    const otherSlots = Array.from({ length: 8 }, (_, i) => i).filter((i) => i !== a && i !== b);
    if (matched) {
      arr[a] = TWIN_FLIP_LABELS[0];
      arr[b] = TWIN_FLIP_LABELS[0];
      const rest = shuffleClient([1, 1, 2, 2, 3, 3].map((n) => TWIN_FLIP_LABELS[n]));
      otherSlots.forEach((slot, i) => { arr[slot] = rest[i]; });
    } else {
      arr[a] = TWIN_FLIP_LABELS[0];
      arr[b] = TWIN_FLIP_LABELS[1];
      const rest = shuffleClient([0, 1, 2, 2, 3, 3].map((n) => TWIN_FLIP_LABELS[n]));
      otherSlots.forEach((slot, i) => { arr[slot] = rest[i]; });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks.length === 2, resultKey]);

  const flipDelay = 0.2, flipDuration = 0.5;

  function pick(i: number) {
    if (picks.length >= 2 || picks.includes(i)) return;
    const next = [...picks, i];
    setPicks(next);
    if (next.length === 2) setTimeout(() => onRevealed?.(), (flipDelay + flipDuration) * 1000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.p
        initial={{ opacity: 1 }}
        animate={{ opacity: labels ? 0 : 1 }}
        className="text-sm text-zinc-400 h-5"
      >
        Pick 2 cards to flip ({picks.length}/2)
      </motion.p>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-fit mx-auto" style={{ perspective: 600 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const isPicked = picks.includes(i);
          const Icon = labels ? MEMORY_PAIR_ICON[labels[i]] : undefined;
          return (
            <motion.button
              key={i}
              type="button"
              disabled={picks.length >= 2}
              onClick={() => pick(i)}
              className="relative w-16 h-16 sm:w-20 sm:h-20"
              style={{ perspective: 600, cursor: picks.length < 2 ? "pointer" : "default" }}
              whileHover={picks.length < 2 ? { y: -3 } : undefined}
              whileTap={picks.length < 2 ? { scale: 0.95 } : undefined}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: labels ? 180 : 0 }}
                transition={{ delay: labels ? flipDelay : 0, duration: flipDuration, ease: "easeIn" }}
              >
                <div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-800 to-zinc-950 border-2 flex items-center justify-center text-indigo-200 text-xl font-extrabold ${
                    isPicked ? "border-amber-400" : "border-indigo-500/40"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  ?
                </div>
                <div
                  className={`absolute inset-0 rounded-lg bg-zinc-950 border-2 flex items-center justify-center p-2 ${
                    isPicked ? (matched ? "border-emerald-400" : "border-red-400") : "border-zinc-700"
                  }`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {labels && (Icon ? <Icon className="w-full h-full" /> : labels[i])}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
      {labels && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: flipDelay + flipDuration }}
          className="text-sm text-zinc-400"
        >
          {matched ? "Matched! Both picks show the same card" : "No match — your two picks differ"}
        </motion.p>
      )}
    </div>
  );
}

// A reel that visibly spins through a strip of random filler symbols before landing on the
// real result — each reel stops a bit later than the last, like a real slot machine — instead
// of the old instant blur-drop-in that was over before you could see it happen.
function Reel({ symbol, index, resultKey }: { symbol: string; index: number; resultKey: string }) {
  const itemSize = 112; // px, matches the w-28/h-28 filler cell below (7rem)
  const strip = useMemo(() => {
    const fillerCount = 14;
    const filler = Array.from({ length: fillerCount }, () => ALL_SLOT_SYMBOLS[Math.floor(Math.random() * ALL_SLOT_SYMBOLS.length)]);
    return [...filler, symbol];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey]);

  const delay = index * 0.25;
  const duration = 1.5 + index * 0.25;

  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-zinc-950 border-2 border-amber-500/30 shadow-[0_0_20px_-4px_rgba(245,158,11,0.5)]">
      {/* Fixed-size viewport exactly one item tall, centered in the (slightly larger) decorative
          frame — the strip below is positioned in this viewport's own top-anchored coordinate
          space, not the frame's, so the animation math (move up N * itemSize) lines up with what
          actually ends up visible instead of fighting the frame's flex-centering. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative overflow-hidden" style={{ width: itemSize, height: itemSize }}>
          <motion.div
            key={resultKey}
            className="absolute top-0 left-0 w-full flex flex-col items-center"
            initial={{ y: 0 }}
            animate={{ y: -(strip.length - 1) * itemSize }}
            transition={{ delay, duration, ease: [0.12, 0.8, 0.2, 1] }}
          >
            {strip.map((s, i) => {
              const SIcon = SYMBOL_ICON[s];
              return (
                <div key={i} className="shrink-0 flex items-center justify-center" style={{ width: itemSize, height: itemSize }}>
                  {SIcon ? <SIcon className="w-full h-full" /> : s}
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/** A real conic-gradient wheel that spins several full turns and settles with `targetIndex`'s segment under the fixed top pointer. */
function SpinWheel({ segments, targetIndex, resultKey, size = 300 }: {
  segments: { label: string; color: string; textColor?: string; weight?: number }[];
  targetIndex: number;
  resultKey: string;
  size?: number;
}) {
  const n = segments.length;
  // Wedge angle is proportional to `weight` (defaulting to equal shares when omitted, e.g.
  // roulette's 37 same-odds pockets) — a rare jackpot segment should be a visibly thin sliver,
  // not the same size as a common one, so the wheel's own geometry communicates the real odds.
  const totalWeight = segments.reduce((s, seg) => s + (seg.weight ?? 1), 0);
  const starts = useMemo(() => {
    let acc = 0;
    return segments.map((seg) => {
      const start = acc;
      acc += ((seg.weight ?? 1) / totalWeight) * 360;
      return start;
    });
  }, [segments, totalWeight]);
  const angleOf = (i: number) => ((segments[i].weight ?? 1) / totalWeight) * 360;
  const gradient = segments.map((s, i) => `${s.color} ${starts[i]}deg ${starts[i] + angleOf(i)}deg`).join(", ");
  const targetMid = starts[targetIndex] + angleOf(targetIndex) / 2;
  const targetAngle = 8 * 360 - targetMid;
  // A label only fits on a wedge wide enough to hold it — on a 12-segment wheel the two thin
  // jackpot slivers (a couple of degrees each) would just overlap illegible text, so those skip
  // the label rather than every segment being all-or-nothing gated by segment count.
  const minLabelAngle = 14;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative drop-shadow-[0_0_40px_-8px_rgba(245,158,11,0.6)]" style={{ width: size, height: size }}>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-amber-400" />
        <motion.div
          key={resultKey}
          className="w-full h-full rounded-full border-[6px] border-zinc-700 relative overflow-hidden"
          style={{ backgroundImage: `conic-gradient(${gradient})` }}
          initial={{ rotate: 0 }}
          animate={{ rotate: targetAngle }}
          transition={{ duration: 4, ease: [0.14, 0.9, 0.2, 1] }}
        >
          {/* boundary lines — without these, same-colored neighboring segments (e.g. the grey
              loss/small-win tier) visually merge into one blob and the wheel reads as having
              far fewer segments than it actually has */}
          {n > 1 && starts.map((deg, i) => (
            <div
              key={`b-${i}`}
              className="absolute left-1/2 top-1/2 origin-top w-px h-1/2 bg-black/30"
              style={{ transform: `translateX(-50%) rotate(${deg}deg)` }}
            />
          ))}
          {segments.map((s, i) => {
            if (angleOf(i) < minLabelAngle) return null;
            const mid = starts[i] + angleOf(i) / 2;
            // Position via trig so the label sits in its wedge and spins along with the disk
            // (it has to, or it'd land on the wrong color once the wheel stops) — but counter-
            // rotate the glyphs themselves by the wheel's own final resting angle, so at rest
            // the text reads upright and horizontal no matter where its wedge ends up, instead
            // of upside-down on the lower half or sideways near 3/9 o'clock.
            const rad = ((mid - 90) * Math.PI) / 180;
            const left = 50 + 34 * Math.cos(rad);
            const top = 50 + 34 * Math.sin(rad);
            return (
              <span
                key={i}
                className="absolute text-sm sm:text-base font-bold"
                style={{
                  left: `${left}%`, top: `${top}%`, color: s.textColor ?? "#fff",
                  transform: `translate(-50%, -50%) rotate(${-targetAngle}deg)`,
                }}
              >
                {s.label}
              </span>
            );
          })}
        </motion.div>
        <div className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-500 shadow-inner" />
        </div>
      </div>
    </div>
  );
}

function Coin({ side, resultKey }: { side: string; resultKey: string }) {
  if (side === "edge") {
    return (
      <div className="flex flex-col items-center gap-2">
        <IconCoinFace label="?" className="w-28 h-28 rotate-90" />
        <span className="text-lg font-bold text-zinc-300">Landed on edge</span>
      </div>
    );
  }
  const spins = side === "heads" ? 4 : 4.5;
  return (
    <div className="flex justify-center" style={{ perspective: 800 }}>
      <motion.div
        key={resultKey}
        className="relative w-44 h-44 sm:w-56 sm:h-56 drop-shadow-[0_0_30px_-4px_rgba(245,158,11,0.7)]"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: spins * 360 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 rounded-full" style={{ backfaceVisibility: "hidden" }}>
          <IconEagle className="w-full h-full" crisp />
        </div>
        <div className="absolute inset-0 rounded-full" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <IconLaurelStar className="w-full h-full" />
        </div>
      </motion.div>
    </div>
  );
}

// Multipliers span 1.01x to (theoretically) thousands of x, so a linear height would pin almost
// every real roll to the very bottom pixel — log-scale the climb instead, capped at a "ceiling"
// multiplier so anything above it just reads as "off the top of the sky".
const LIMBO_SKY_CEILING = 50;
function limboHeightFrac(mult: number) {
  return Math.min(1, Math.log(Math.max(mult, 1)) / Math.log(LIMBO_SKY_CEILING));
}

const LIMBO_STARS = [12, 22, 34, 48, 58, 68, 78, 88, 18, 42, 62, 82, 30, 92, 5, 96, 40, 70];
const LIMBO_FLIGHT_S = 1.4;
// Ruler ticks along the sky's height so it reads as an altitude scale, not just empty space —
// evenly spaced on the log scale itself (not evenly spaced in x) so they land at legible heights.
const LIMBO_TICKS = [1, 1.5, 2, 3, 5, 10, 20, 50];

/** A comet climbs a starfield toward a dashed target line — cleared it (win) or fizzled out
 * below it (loss) — instead of a bare number appearing out of nowhere. A live readout riding
 * next to it counts up in real time as it climbs, so "how high is it going" is answered by
 * watching the flight, not just by reading the final number after the fact. */
function LimboLaunch({ targetMult, rolledMult, cleared, resultKey }: {
  targetMult: number; rolledMult: number; cleared: boolean; resultKey: string;
}) {
  const targetFrac = limboHeightFrac(targetMult);
  const rolledFrac = limboHeightFrac(rolledMult);
  const rocketBottom = `${6 + rolledFrac * 82}%`;

  // The comet only shatters right at touchdown, not for the whole flight — otherwise a loss
  // just shows a fading-in burst the entire climb instead of something that fails at the end.
  const [exploded, setExploded] = useState(false);
  useEffect(() => {
    setExploded(false);
    if (!cleared) {
      const t = setTimeout(() => setExploded(true), LIMBO_FLIGHT_S * 1000 * 0.92);
      return () => clearTimeout(t);
    }
  }, [resultKey, cleared]);

  // Live altitude readout: recompute the "multiplier so far" every frame from the same log-scale
  // math the comet's height uses, driven by an eased progress clock — so the number on screen and
  // the dot's position always agree, instead of the number only appearing once at the very end.
  const [liveMult, setLiveMult] = useState(1);
  useEffect(() => {
    setLiveMult(1);
    let raf = 0;
    const start = performance.now();
    const durationMs = LIMBO_FLIGHT_S * 1000;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setLiveMult(Math.pow(LIMBO_SKY_CEILING, rolledFrac * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey]);

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-3">
      <motion.div
        className="relative w-full h-64 rounded-xl overflow-hidden border border-indigo-500/20"
        style={{ background: "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(99,102,241,0.15) 0%, transparent 70%), linear-gradient(180deg, #0a0a14 0%, #050508 100%)" }}
        animate={!cleared && exploded ? { x: [0, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* twinkling starfield */}
        {LIMBO_STARS.map((left, i) => (
          <motion.span
            key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-white/60"
            style={{ left: `${left}%`, top: `${(i * 37) % 90 + 3}%` }}
            animate={{ opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 1.6 + (i % 5) * 0.3, repeat: Infinity, delay: (i % 7) * 0.2, ease: "easeInOut" }}
          />
        ))}

        {/* altitude ruler — tick marks up both edges so the climb reads against a scale instead
            of empty sky, since "how high" is meaningless without something to measure it by */}
        {LIMBO_TICKS.map((m) => {
          const bottom = `${6 + limboHeightFrac(m) * 82}%`;
          return (
            <div key={m} className="absolute left-0 right-0 flex items-center justify-between px-1.5 pointer-events-none" style={{ bottom }}>
              <span className="text-[9px] text-zinc-500 tabular-nums">{m}x</span>
              <div className="flex-1 border-t border-white/[0.06] mx-1.5" />
              <span className="text-[9px] text-zinc-500 tabular-nums">{m}x</span>
            </div>
          );
        })}

        {/* launch-pad glow, pulses once as the rocket lifts off */}
        <motion.div
          key={`${resultKey}-pad`}
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{ bottom: "-10px", width: 10, height: 10, background: "radial-gradient(circle, rgba(251,191,36,0.9), transparent 70%)" }}
          initial={{ scale: 0.5, opacity: 0.9 }}
          animate={{ scale: 6, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* dashed target line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-amber-400/50"
          style={{ bottom: `${6 + targetFrac * 82}%` }}
        >
          <span className="absolute right-1.5 -top-4 text-[10px] font-semibold text-amber-400/80">
            min {targetMult.toFixed(2)}x to cash out
          </span>
        </div>

        {/* exhaust trail */}
        <motion.div
          key={`${resultKey}-trail`}
          className="absolute left-1/2 -translate-x-1/2 w-1 rounded-full"
          style={{ background: "linear-gradient(180deg, rgba(251,191,36,0.7), transparent)", bottom: "2%" }}
          initial={{ height: 0, opacity: 0.9 }}
          animate={{ height: rocketBottom, opacity: exploded ? 0 : [0.9, 0.9, 0] }}
          transition={{ duration: LIMBO_FLIGHT_S, ease: [0.3, 0, 0.6, 1], times: [0, 0.85, 1] }}
        />

        {/* the comet — a glowing core with a tapered tail, not a stock emoji — plus a live
            altitude readout riding right alongside it */}
        <motion.div
          key={resultKey}
          className="absolute left-1/2"
          style={{ bottom: "2%" }}
          initial={{ bottom: "2%", opacity: 0 }}
          animate={{ bottom: rocketBottom, opacity: 1 }}
          transition={{ duration: LIMBO_FLIGHT_S, ease: [0.22, 0.9, 0.3, 1] }}
        >
          <div className="relative flex items-center justify-center" style={{ width: 0, height: 0 }}>
            {!exploded ? (
              <>
                {/* tapered tail, trailing below the core in the direction of travel */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-1"
                  style={{
                    width: 9, height: 44,
                    clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
                    background: "linear-gradient(180deg, rgba(253,224,71,0.95), rgba(245,158,11,0.55) 55%, transparent)",
                    filter: "blur(0.5px)",
                  }}
                />
                {/* glowing core */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: 16, height: 16,
                    background: "radial-gradient(circle at 35% 35%, #fff7d6, #fbbf24 45%, #d97706 100%)",
                    boxShadow: "0 0 16px 4px rgba(251,191,36,0.85), 0 0 3px 1px #fff7d6",
                  }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            ) : (
              <>
                {/* shatter burst — a dimming ember core plus debris flying outward, once */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ width: 16, height: 16, background: "radial-gradient(circle, #7f1d1d, #1c1917 70%)", boxShadow: "0 0 10px 2px rgba(220,38,38,0.5)" }}
                />
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  return (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-red-400"
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ x: Math.cos(angle) * 30, y: Math.sin(angle) * 30 - 10, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  );
                })}
              </>
            )}

            {/* live altitude tag, riding beside the comet */}
            {!exploded && (
              <span
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-bold tabular-nums text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
              >
                {liveMult.toFixed(2)}x
              </span>
            )}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        key={`${resultKey}-readout`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: LIMBO_FLIGHT_S - 0.2, duration: 0.4 }}
        className="flex flex-col items-center"
      >
        {/* The payout is always the target multiplier, never how high the roll actually climbed
            — leading with the roll here made it look like that number was what got paid. */}
        <span className={`text-4xl font-extrabold tabular-nums ${cleared ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]" : "text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]"}`}>
          {cleared ? `paid ${targetMult.toFixed(2)}x` : "missed"}
        </span>
        <span className="text-xs text-zinc-500 mt-1">roll reached {rolledMult.toFixed(2)}x</span>
      </motion.div>
      <div className="w-full text-sm text-zinc-500 flex justify-between">
        <span>your target (min to win): <span className="text-zinc-300 font-semibold">{targetMult.toFixed(2)}x</span></span>
        <span>{cleared ? "cleared" : "missed"}</span>
      </div>
    </div>
  );
}

// Mirrors the payout table in src/lib/games/registry.ts (plinko) — display-only, not re-derived from the server.
const PLINKO_PAYOUTS = [0.354, 0.72, 0.96, 1.68, 3.6, 8.9, 43.2];

/** A real peg-board: the ball zigzags row by row and converges on the landed bucket, instead of a flat row of dots. */
function PlinkoBoard({ bucket, rows, resultKey }: { bucket: number; rows: number; resultKey: string }) {
  const bucketCount = rows + 1;
  const finalX = (bucket / rows) * 100;
  const steps = 8;
  const xKeyframes = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const amplitude = 26 * (1 - t);
    const wobble = i % 2 === 0 ? 1 : -1;
    return 50 * (1 - t) + finalX * t + amplitude * wobble * (1 - t);
  });
  xKeyframes[steps] = finalX;
  const yKeyframes = Array.from({ length: steps + 1 }, (_, i) => (i / steps) * 88 + 4);

  const mid = rows / 2;
  // Peg board is a triangle (3 pegs at the top row, widening by one every row) like a real
  // Plinko/Galton board — a uniform block of dots made every row look equally reachable,
  // which read as "the ball can't fall toward the edges/big multipliers".
  const pegRows = Math.min(rows, 10);
  const firstRowPegs = 3;

  // Only reveal which bucket actually won once the ball's fall animation has actually
  // finished — highlighting the landing bucket from the first frame (before the ball even
  // started dropping) spoiled the outcome and looked like the ball couldn't reach it.
  const [landed, setLanded] = useState(false);
  useEffect(() => { setLanded(false); }, [resultKey]);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      <div className="relative w-full h-56 rounded-xl bg-black/30 border border-emerald-500/20 overflow-hidden">
        {Array.from({ length: pegRows }, (_, r) => {
          const count = firstRowPegs + r;
          // How much of the board's width this row's pegs spread across — narrow near the
          // top, reaching (almost) the full 0–100% by the bottom row so the peg field actually
          // covers the same coordinate space the ball travels and the bucket row below spans,
          // instead of a fixed-width block that left the edge buckets outside the peg field.
          const widthFrac = 0.28 + 0.72 * (pegRows > 1 ? r / (pegRows - 1) : 1);
          const top = 6 + (pegRows > 1 ? (r / (pegRows - 1)) * 82 : 0);
          return (
            <div key={r} className="absolute left-0 right-0" style={{ top: `${top}%` }}>
              {Array.from({ length: count }, (_, c) => {
                const frac = count > 1 ? c / (count - 1) - 0.5 : 0;
                const left = 50 + frac * widthFrac * 100;
                return (
                  <span
                    key={c}
                    className="absolute w-1.5 h-1.5 rounded-full bg-zinc-600 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${left}%` }}
                  />
                );
              })}
            </div>
          );
        })}
        <motion.div
          key={resultKey}
          className="absolute w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.9)]"
          style={{ left: 0, top: 0, marginLeft: -8, marginTop: -8 }}
          initial={{ left: "50%", top: "4%" }}
          animate={{ left: xKeyframes.map((x) => `${x}%`), top: yKeyframes.map((y) => `${y}%`) }}
          transition={{ duration: 1.6, ease: "easeIn", times: yKeyframes.map((y) => (y - 4) / 88) }}
          onAnimationComplete={() => setLanded(true)}
        />
      </div>
      <div className="flex gap-1 justify-center w-full overflow-x-auto">
        {Array.from({ length: bucketCount }, (_, i) => {
          const dist = Math.abs(i - mid);
          const payout = PLINKO_PAYOUTS[Math.min(Math.round(dist), PLINKO_PAYOUTS.length - 1)];
          const isLanded = landed && i === bucket;
          return (
            <motion.div
              key={i}
              initial={isLanded ? { scale: 0.5 } : false}
              animate={isLanded ? { scale: 1 } : false}
              transition={{ delay: 1.5, type: "spring" }}
              className={`flex-1 min-w-[28px] rounded-md py-1.5 text-center text-[10px] font-bold ${
                isLanded ? "bg-amber-500 text-zinc-950 shadow-[0_0_16px_-2px_rgba(245,158,11,0.9)]" : payout >= 3 ? "bg-red-900/60 text-red-300" : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {payout}x
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Mirrors the weighted segment list in src/lib/games/registry.ts (wheel) exactly — value AND
// weight — so the wedge each color/size represents on screen matches the real server odds.
// Grey = a loss or a small win (<=1.5x), yellow = a solid win, red = a rare jackpot.
// Only 3 distinct values / 2 distinct sizes — see the comment in registry.ts's wheel entry for
// why (a wheel with many odd-sized wedges reads as clutter, not a wheel).
// All 12 wedges equal size now — see the comment in registry.ts's wheel entry for why the
// jackpot is a modest 7.52x rather than something flashier: that's the real ceiling a single
// 1-in-12 segment can pay without the other 11 segments' odds becoming fake.
// Strict win/lose/win/lose order all the way around — see the comment in registry.ts's wheel
// entry.
// Mirrors registry.ts's TANK_MULT/TANK_ZONES exactly — 5 markers, near = common/cheap,
// far = rare/big, so the payout each marker pays server-side matches what's drawn on screen.
const TANK_MULT = [2.4, 3.2, 6.4, 9.6, 19.2];
const TANK_MARKER_X = [90, 170, 250, 330, 400];

const WHEEL_SEGMENTS = [
  { label: "1x", color: "#f59e0b", mult: 1 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "3x", color: "#f59e0b", mult: 3 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "1.5x", color: "#f59e0b", mult: 1.5 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "1.8x", color: "#f59e0b", mult: 1.8 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "2x", color: "#f59e0b", mult: 2 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "10x", color: "#dc2626", mult: 10 },
  { label: "0x", color: "#71717a", mult: 0 },
];
const ROULETTE_RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
// Real European single-zero wheel order (not sequential 0–36) — using plain 0..36 order made
// same-color numbers cluster next to each other on the drawn wheel, which read as "duplicate"
// segments even though every number is still only there once.
const ROULETTE_WHEEL_ORDER = [
  0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26,
];

export function GameResultView({ category, gameKey, detail, win, onRevealed }: {
  category: string; gameKey: string; detail: Record<string, unknown>; win: boolean; onRevealed?: () => void;
}) {
  const resultKey = JSON.stringify(detail);

  switch (category) {
    case "slots": {
      const reels = detail.reels as string[];
      return <div className="flex gap-3 sm:gap-4 justify-center">{reels.map((s, i) => <Reel key={i} symbol={s} index={i} resultKey={resultKey} />)}</div>;
    }
    case "dice": {
      if (gameKey === "sic-bo") {
        const dice = detail.dice as number[];
        const sum = detail.sum as number;
        const bet = detail.bet as string;
        const number = detail.number as number | undefined;
        const isTriple = detail.isTriple as boolean;
        const betLabel = bet === "triple" ? `triple ${number}s` : bet === "any-triple" ? "any triple" : bet;
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              {dice.map((v, i) => <Die key={i} value={v} index={i} resultKey={resultKey} />)}
            </div>
            <div className="text-2xl font-extrabold text-zinc-200">Total: {sum}</div>
            <div className="text-sm text-zinc-400">
              You bet <span className="capitalize text-amber-400 font-semibold">{betLabel}</span>
              {isTriple && bet !== "triple" && bet !== "any-triple" && (
                <span className="text-red-400 font-semibold"> — triple! Both sides lose</span>
              )}
            </div>
          </div>
        );
      }
      if (gameKey === "tank-shot") {
        const landed = detail.landed as number;
        const target = detail.target as number;
        const win = landed === target;
        const width = 420, height = 160, groundY = 128;
        const markerX = TANK_MARKER_X;
        const fireAt = 0.35;
        const flightDuration = 1;
        const impactAt = fireAt + flightDuration;
        const startX = 48, startY = groundY - 30, endX = markerX[landed], endY = groundY - 6;
        const ctrlX = (startX + endX) / 2, ctrlY = startY - 60 - Math.abs(endX - startX) * 0.35;
        // Sample the quadratic bezier by hand into keyframe points — framer-motion animates
        // cx/cy keyframe arrays reliably everywhere, unlike CSS motion-path on SVG shapes.
        const arcSteps = 12;
        const bezier = (t: number, p0: number, p1: number, p2: number) => (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;
        const arcXs = Array.from({ length: arcSteps + 1 }, (_, i) => bezier(i / arcSteps, startX, ctrlX, endX));
        const arcYs = Array.from({ length: arcSteps + 1 }, (_, i) => bezier(i / arcSteps, startY, ctrlY, endY));
        const shellPath = `M ${arcXs.map((x, i) => `${x} ${arcYs[i]}`).join(" L ")}`;
        const impactColor = win ? "#34d399" : "#f87171";
        return (
          <div className="flex flex-col items-center gap-3">
            <motion.svg
              viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="max-w-full rounded-lg"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ delay: impactAt, duration: 0.25 }}
            >
              <defs>
                <linearGradient id="tank-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#1e293b" />
                  <stop offset="1" stopColor="#0c1420" />
                </linearGradient>
                <radialGradient id="tank-sun" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#fbbf24" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width={width} height={height} fill="url(#tank-sky)" />
              <circle cx="370" cy="30" r="45" fill="url(#tank-sun)" />
              <circle cx="370" cy="30" r="10" fill="#fde68a" opacity="0.7" />
              <rect x="0" y={groundY} width={width} height={height - groundY} fill="#1c1917" />
              <line x1="0" y1={groundY} x2={width} y2={groundY} stroke="#44403c" strokeWidth="2" />

              {/* tank: tracks, hull, turret, recoiling barrel */}
              <g>
                <rect x="6" y={groundY - 12} width="34" height="7" rx="2" fill="#292524" />
                <rect x="10" y={groundY - 22} width="26" height="12" rx="3" fill="#3f6212" />
                <circle cx="24" cy={groundY - 24} r="8" fill="#4d7c0f" />
                <motion.line
                  x1="30" y1={groundY - 26} x2="48" y2={groundY - 34}
                  stroke="#84cc16" strokeWidth="4" strokeLinecap="round"
                  initial={{ x2: 48, y2: groundY - 34 }}
                  animate={{ x2: [48, 40, 48], y2: [groundY - 34, groundY - 30, groundY - 34] }}
                  transition={{ delay: fireAt, duration: 0.2 }}
                />
              </g>
              {/* muzzle flash */}
              <motion.circle
                cx="50" cy={groundY - 35} r="9" fill="#fde68a"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.3] }}
                transition={{ delay: fireAt, duration: 0.25 }}
                style={{ transformOrigin: "50px " + (groundY - 35) + "px" }}
              />

              {/* dashed trajectory that draws in as the shell flies */}
              <motion.path
                d={shellPath} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: fireAt, duration: flightDuration, ease: "linear" }}
              />

              {markerX.map((mx, i) => (
                <g key={i}>
                  <line x1={mx} y1={groundY} x2={mx} y2={groundY - 26} stroke={i === target ? "#fbbf24" : "#57534e"} strokeWidth="2" />
                  <motion.path
                    d={`M ${mx} ${groundY - 26} L ${mx + 14} ${groundY - 21} L ${mx} ${groundY - 16} Z`}
                    fill={i === target ? "#fbbf24" : "#78716c"}
                    animate={i === target ? { x: [0, -2, 0] } : undefined}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <circle cx={mx} cy={groundY} r={i === target ? 7 : 4.5} fill="#292524" stroke={i === target ? "#fbbf24" : "#57534e"} strokeWidth="2" />
                  <text x={mx} y={groundY + 20} textAnchor="middle" fontSize="11" fontWeight="600" fill={i === target ? "#fbbf24" : "#78716c"}>{TANK_MULT[i]}x</text>
                </g>
              ))}

              {/* smoke trail: several fading puffs chasing the shell a few steps behind along the same arc */}
              {[3, 2, 1].map((lag) => (
                <motion.circle
                  key={lag}
                  r={4 - lag * 0.6}
                  fill="#a8a29e"
                  initial={{ cx: arcXs[0], cy: arcYs[0], opacity: 0 }}
                  animate={{ cx: arcXs.slice(0, arcXs.length - lag), cy: arcYs.slice(0, arcYs.length - lag), opacity: [0, 0.5, 0.5, 0] }}
                  transition={{ delay: fireAt + lag * 0.03, duration: flightDuration, ease: "linear" }}
                />
              ))}

              {/* the shell itself, following the exact arc path */}
              <motion.circle
                key={resultKey}
                r="4.5"
                fill="#fde68a"
                initial={{ cx: arcXs[0], cy: arcYs[0] }}
                animate={{ cx: arcXs, cy: arcYs }}
                transition={{ delay: fireAt, duration: flightDuration, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(253,230,138,0.9))" }}
              />

              {/* impact burst */}
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`burst-${i}`}
                  cx={markerX[landed]} cy={groundY}
                  r="2"
                  fill="none"
                  stroke={impactColor}
                  strokeWidth="2"
                  initial={{ opacity: 0, r: 2 }}
                  animate={{ opacity: [0, 0.8, 0], r: [2, 20 + i * 8, 24 + i * 8] }}
                  transition={{ delay: impactAt + i * 0.06, duration: 0.5, ease: "easeOut" }}
                />
              ))}
            </motion.svg>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: impactAt + 0.15 }}
              className={`text-lg font-bold ${win ? "text-emerald-400" : "text-red-400"}`}
            >
              {win ? `Direct hit on marker ${target + 1}!` : `Aimed at marker ${target + 1}, landed on marker ${landed + 1}`}
            </motion.div>
          </div>
        );
      }
      const roll = detail.roll as number;
      const targetBp = detail.targetBp as number;

      // Limbo: same underlying roll/target as Dice Roll, but framed as "how high did the
      // multiplier climb" (a rocket-to-target readout) instead of a roll-under progress bar —
      // the two games share math but shouldn't look identical.
      if (gameKey === "limbo") {
        const targetMult = 9600 / Math.max(targetBp, 1);
        const rolledMult = 9600 / Math.max(roll, 1);
        // Whether the rocket physically cleared the dashed target line is its own question from
        // whether the round was net-profitable (the `win` prop, used by the banner outside this
        // component) — a stake of 1 rounding a win down to net 0 shouldn't make an actually-cleared
        // roll draw as an explosion below the line it visibly passed.
        const cleared = roll < targetBp;
        return <LimboLaunch targetMult={targetMult} rolledMult={rolledMult} cleared={cleared} resultKey={resultKey} />;
      }

      const targetPct = (targetBp / 9999) * 100;
      return (
        <div className="w-full max-w-md">
          <div className="relative h-7 rounded-full bg-zinc-800 overflow-hidden shadow-inner">
            <div className="absolute inset-y-0 left-0 bg-emerald-600/40" style={{ width: `${targetPct}%` }} />
            <motion.div
              key={resultKey}
              className="absolute top-1/2 w-3 h-10 -mt-5 rounded bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)]"
              initial={{ left: "0%" }}
              animate={{ left: `${(roll / 9999) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-sm text-zinc-500 mt-2">
            <span>0</span><span className="text-zinc-300 font-semibold">roll: {roll}</span><span>9999</span>
          </div>
        </div>
      );
    }
    case "wheel": {
      if ("side" in detail) {
        return <Coin side={detail.side as string} resultKey={resultKey} />;
      }
      if ("number" in detail) {
        const number = detail.number as number;
        const segments = ROULETTE_WHEEL_ORDER.map((n) => ({
          label: String(n),
          color: n === 0 ? "#059669" : ROULETTE_RED.has(n) ? "#dc2626" : "#18181b",
        }));
        const targetIndex = ROULETTE_WHEEL_ORDER.indexOf(number);
        return <SpinWheel segments={segments} targetIndex={targetIndex} resultKey={resultKey} size={400} />;
      }
      const segment = detail.segment as number;
      const targetIndex = Math.max(0, WHEEL_SEGMENTS.findIndex((s) => s.mult === segment));
      return <SpinWheel segments={WHEEL_SEGMENTS} targetIndex={targetIndex} resultKey={resultKey} size={360} />;
    }
    case "board": {
      if ("called" in detail) {
        const called = detail.called as number[];
        const winLine = detail.winLine as number[] | null;
        // Numbers "call" in the order they were drawn, not grid order — reads like a real bingo
        // caller going number by number, and the completed line only lights up once every call
        // has landed, so you can't tell a line is done before the last number in it is called.
        const callOrder = new Map(called.map((pos, i) => [pos, i]));
        const callStep = 0.28;
        const revealedAt = called.length * callStep + 0.3;
        return (
          <div className="flex flex-col items-center gap-3">
            {/* Balls drop into the caller tray one at a time, in draw order — a real bingo caller
                announces one number at a time instead of dumping the whole card at once, and the
                grid cell for each number lights up on the same beat as its ball lands. */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-xs min-h-[2.25rem]">
              {called.map((pos, i) => (
                <motion.div
                  key={`${resultKey}-ball-${i}`}
                  initial={{ scale: 0, y: -16, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ delay: i * callStep, type: "spring", stiffness: 300, damping: 16 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-200 flex items-center justify-center text-[11px] font-extrabold text-amber-950 shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                >
                  {pos + 1}
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5 w-fit mx-auto">
              {Array.from({ length: 25 }, (_, i) => {
                const order = callOrder.get(i);
                const isCalled = order !== undefined;
                const onLine = winLine?.includes(i) ?? false;
                return (
                  <div
                    key={`${resultKey}-${i}`}
                    className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-md flex items-center justify-center text-xs sm:text-sm font-bold border-2 bg-zinc-900 text-zinc-600 border-zinc-800"
                  >
                    {i + 1}
                    {/* Green only fades in exactly on this number's own beat in the call order —
                        not at mount, so an uncalled number can't be told apart from a called one
                        by squinting at a faint color before its turn. */}
                    {isCalled && (
                      <motion.div
                        className="absolute inset-0 rounded-md bg-emerald-700 text-white border-2 border-emerald-500 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (order as number) * callStep, type: "spring" }}
                      >
                        {i + 1}
                      </motion.div>
                    )}
                    {/* The gold "this is part of the completed line" color only appears once the
                        whole line is confirmed (revealedAt) — never earlier, even for a number
                        that happened to already be called, so a line can't be spotted early. */}
                    {onLine && (
                      <motion.div
                        className="absolute inset-0 rounded-md bg-amber-500 text-zinc-950 border-2 border-amber-300 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: revealedAt, duration: 0.3 }}
                      >
                        {i + 1}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: revealedAt }}
              className="text-sm text-zinc-400"
            >
              {winLine ? "Line complete — gold squares" : `${called.length} numbers called, no line yet`}
            </motion.p>
          </div>
        );
      }
      if ("prize" in detail) {
        return (
          <GoldenTicketPile
            prize={detail.prize as number}
            decoys={detail.decoys as number[]}
            resultKey={resultKey}
            onRevealed={onRevealed}
          />
        );
      }
      if ("cells" in detail) {
        const cells = detail.cells as string[];
        const winLine = detail.winLine as number[] | null;
        // Cells flip one at a time, left-to-right — real scratch-card pacing — but the win/lose
        // line highlight and outcome text only appear once the LAST cell has flipped, so seeing
        // symbols land one by one never tips you off before the full card is revealed.
        const flipStagger = 0.18;
        const flipDuration = 0.4;
        const revealedAt = (cells.length - 1) * flipStagger + flipDuration;
        return (
          <div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-fit mx-auto" style={{ perspective: 600 }}>
              {cells.map((sym, i) => {
                const Icon = SYMBOL_ICON[sym];
                const onLine = winLine?.includes(i) ?? false;
                return (
                  <div key={`${resultKey}-${i}`} className="relative w-16 h-16 sm:w-20 sm:h-20">
                    <motion.div
                      className="absolute inset-0"
                      style={{ transformStyle: "preserve-3d" }}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 180 }}
                      transition={{ delay: i * flipStagger, duration: flipDuration, ease: "easeIn" }}
                    >
                      <div
                        className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-500/40 flex items-center justify-center text-amber-200 text-2xl font-extrabold"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        ?
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-zinc-950 border-2 flex items-center justify-center p-2"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        initial={{ borderColor: "#3f3f46", boxShadow: "0 0 0px rgba(245,158,11,0)" }}
                        animate={onLine ? { borderColor: "#fbbf24", boxShadow: "0 0 20px -2px rgba(245,158,11,0.9)" } : undefined}
                        transition={{ delay: revealedAt, duration: 0.3 }}
                      >
                        {Icon ? <Icon className="w-full h-full" /> : sym}
                      </motion.div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <motion.p
              className="text-center text-sm text-zinc-400 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: revealedAt }}
            >
              {winLine ? "Matching line — gold outline" : "No matching line of 3"}
            </motion.p>
          </div>
        );
      }
      if ("grid" in detail) {
        const grid = detail.grid as boolean[];
        const picks = detail.picks as number;
        // The bet resolves all at once (no tile-by-tile picking yet), so the full board is
        // revealed after the fact — the picked tiles (outlined) are what decided the round;
        // the rest shows what would have happened, so the grid isn't just one lone icon.
        return (
          <div>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3 w-fit mx-auto">
              {grid.map((isMine, i) => {
                const picked = i < picks;
                return (
                  <motion.div
                    key={`${resultKey}-${i}`}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: picked ? 1 : 0.55 }}
                    transition={{ delay: i * 0.03, duration: 0.25, type: "spring" }}
                    className={`w-12 h-12 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center p-2 sm:p-3 ${
                      isMine ? "bg-red-700" : "bg-emerald-700"
                    } ${picked ? "ring-3 ring-amber-400 shadow-[0_0_24px_-2px_rgba(245,158,11,0.9)]" : ""}`}
                  >
                    {isMine ? <IconMine className="w-full h-full" /> : <IconGem className="w-full h-full" />}
                  </motion.div>
                );
              })}
            </div>
            <p className="text-center text-sm text-zinc-400 mt-3">
              {picks} tile{picks === 1 ? "" : "s"} picked (gold outline) · {grid.filter(Boolean).length} mines on the board
            </p>
          </div>
        );
      }
      if ("reached" in detail) {
        const reached = detail.reached as number;
        const floors = detail.floors as number;
        return (
          <div className="flex flex-col-reverse gap-1.5 items-center">
            {Array.from({ length: floors }, (_, i) => (
              <motion.div
                key={`${resultKey}-${i}`}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12 }}
                className={`w-56 sm:w-64 h-7 rounded-md ${i < reached ? "bg-amber-500 shadow-[0_0_16px_-2px_rgba(245,158,11,0.8)]" : i === reached && !win ? "bg-red-700" : "bg-zinc-800"}`}
              />
            ))}
          </div>
        );
      }
      if ("bucket" in detail) {
        return <PlinkoBoard bucket={detail.bucket as number} rows={detail.rows as number} resultKey={resultKey} />;
      }
      const drawn = detail.drawn as number[];
      const hits = detail.hits as number;
      const picks = (detail.picks as number[] | undefined) ?? [];
      return (
        <div>
          <p className="text-center text-sm text-zinc-400 mb-2">Numbers drawn — gold ring = one of your picks</p>
          <div className="grid grid-cols-8 gap-1 sm:gap-1.5 w-fit mx-auto">
            {drawn.sort((a, b) => a - b).map((n, i) => {
              const isPick = picks.includes(n);
              return (
                <motion.div
                  key={`${resultKey}-${n}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg font-bold flex items-center justify-center text-xs sm:text-base ${
                    isPick
                      ? "bg-amber-500 text-zinc-950 ring-3 ring-emerald-400 shadow-[0_0_16px_-2px_rgba(16,185,129,0.9)]"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {n}
                </motion.div>
              );
            })}
          </div>
          <p className="text-center text-sm text-zinc-300 mt-3 font-medium">
            {hits} of your {picks.length} picks matched
          </p>
        </div>
      );
    }
    case "cards": {
      if ("current" in detail) {
        const guess = detail.guess as string | undefined;
        return (
          <div className="flex flex-col items-center gap-2">
            <CardRow cards={[detail.current as string, detail.nextCard as string]} resultKey={resultKey} />
            {guess && (
              <div className="text-sm text-zinc-400">
                You guessed <span className="capitalize text-amber-400 font-semibold">{guess}</span>
              </div>
            )}
          </div>
        );
      }
      if ("hand" in detail) {
        const combo = detail.combo as string | undefined;
        const won = !!combo && combo !== "No winning hand";
        const revealAt = 0.5;
        return (
          <div className="flex flex-col items-center gap-3">
            <CardRow cards={detail.hand as string[]} resultKey={resultKey} />
            {combo && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: revealAt, type: "spring" }}
                className={`text-lg font-extrabold px-4 py-1.5 rounded-full border-2 ${
                  won
                    ? "text-amber-300 border-amber-400 bg-amber-500/10 shadow-[0_0_20px_-4px_rgba(245,158,11,0.7)]"
                    : "text-zinc-400 border-zinc-700 bg-zinc-900"
                }`}
              >
                {combo}
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: revealAt + 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs w-full max-w-md mt-1"
            >
              {POKER_PAYTABLE.map(([name, mult]) => (
                <div
                  key={name}
                  className={`rounded px-2 py-1 flex items-center justify-between ${
                    combo === name ? "bg-amber-500 text-zinc-950 font-bold" : "bg-zinc-900 text-zinc-500"
                  }`}
                >
                  <span>{name}</span>
                  <span>{mult}x</span>
                </div>
              ))}
            </motion.div>
          </div>
        );
      }
      if (gameKey === "memory-flip") {
        return <TwinFlipBoard matched={detail.matched as boolean} resultKey={resultKey} onRevealed={onRevealed} />;
      }
      if ("player" in detail && "dealer" in detail) {
        return (
          <div className="flex flex-col gap-5 items-center">
            <div>
              <div className="text-sm text-zinc-400 mb-2 text-center font-medium">You ({String(detail.pv)})</div>
              <CardRow cards={detail.player as string[]} resultKey={resultKey} />
            </div>
            <div>
              <div className="text-sm text-zinc-400 mb-2 text-center font-medium">Dealer ({String(detail.dv)})</div>
              <CardRow cards={detail.dealer as string[]} resultKey={`${resultKey}-d`} />
            </div>
          </div>
        );
      }
      {
        // Baccarat: cards land first (each row's own stagger), then the point totals tally up,
        // then the winning side lights up gold while the loser dims — the sequence itself is the
        // explanation ("higher total, so that side glows"), not just a "X wins" line underneath.
        const pv = detail.pv as number;
        const bv = detail.bv as number;
        const winner = detail.winner as "player" | "banker" | "tie";
        const cardsSettleAt = 0.5;
        const tallyAt = cardsSettleAt + 0.15;
        const compareAt = tallyAt + 0.6;
        const playerWins = winner === "player";
        const bankerWins = winner === "banker";
        return (
          <div className="flex flex-col gap-4 items-center">
            <motion.div
              className="flex flex-col items-center rounded-xl p-3 border-2 border-transparent"
              animate={winner === "tie" || playerWins ? {
                borderColor: "#fbbf24", boxShadow: "0 0 24px -4px rgba(245,158,11,0.7)", opacity: 1,
              } : { opacity: 0.45, filter: "grayscale(0.6)" }}
              transition={{ delay: compareAt, duration: 0.4 }}
            >
              <div className="text-sm text-zinc-400 mb-2 text-center font-medium">Player</div>
              <CardRow cards={detail.player as string[]} resultKey={resultKey} />
              <motion.div
                className="mt-2 text-3xl font-extrabold tabular-nums text-amber-400"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: tallyAt, type: "spring" }}
              >
                <CountUp value={pv} delay={tallyAt} resultKey={resultKey} />
              </motion.div>
            </motion.div>

            <motion.div
              className="text-xs text-zinc-500 font-semibold uppercase tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: tallyAt + 0.1 }}
            >
              vs
            </motion.div>

            <motion.div
              className="flex flex-col items-center rounded-xl p-3 border-2 border-transparent"
              animate={winner === "tie" || bankerWins ? {
                borderColor: "#fbbf24", boxShadow: "0 0 24px -4px rgba(245,158,11,0.7)", opacity: 1,
              } : { opacity: 0.45, filter: "grayscale(0.6)" }}
              transition={{ delay: compareAt, duration: 0.4 }}
            >
              <div className="text-sm text-zinc-400 mb-2 text-center font-medium">Banker</div>
              <CardRow cards={detail.banker as string[]} resultKey={`${resultKey}-b`} />
              <motion.div
                className="mt-2 text-3xl font-extrabold tabular-nums text-amber-400"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: tallyAt, type: "spring" }}
              >
                <CountUp value={bv} delay={tallyAt} resultKey={`${resultKey}-b`} />
              </motion.div>
            </motion.div>

            <motion.div
              className="text-amber-400 text-base font-bold text-center"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: compareAt + 0.2 }}
            >
              {winner === "tie"
                ? `Tie at ${pv} — push`
                : `${winner === "player" ? "Player" : "Banker"} wins, ${Math.max(pv, bv)} to ${Math.min(pv, bv)}`}
            </motion.div>
          </div>
        );
      }
    }
    default:
      return <pre className="text-xs text-zinc-500 overflow-x-auto">{JSON.stringify(detail, null, 2)}</pre>;
  }
}

/**
 * A static "what this game looks like" preview shown before the first bet — replaces a generic
 * dice icon + "place your stake" with an actual, non-animated look at the game's mechanic.
 */
export function IdlePreview({ category, gameKey }: { category: string; gameKey: string }) {
  if (category === "slots") {
    const symbols = gameKey === "slots-fruits" ? ["STAR", "GRAPE", "WATERMELON"] : ["7", "BAR", "BELL"];
    return (
      <div className="flex gap-2">
        {symbols.map((s, i) => {
          const Icon = SYMBOL_ICON[s];
          return (
            <div key={i} className="w-16 h-16 rounded-lg bg-zinc-950 border border-zinc-700 flex items-center justify-center">
              <Icon className="w-11 h-11" />
            </div>
          );
        })}
      </div>
    );
  }
  if (category === "dice") {
    if (gameKey === "limbo") {
      return <div className="text-4xl font-extrabold tabular-nums text-zinc-600">1.00x</div>;
    }
    if (gameKey === "sic-bo") {
      return (
        <div className="flex gap-3">
          {[3, 5, 2].map((v, i) => <Die key={i} value={v} index={i} resultKey="idle" />)}
        </div>
      );
    }
    if (gameKey === "tank-shot") {
      const groundY = 40;
      return (
        <svg viewBox="0 0 160 56" width="160" height="56">
          <line x1="0" y1={groundY} x2="160" y2={groundY} stroke="#3f3f46" strokeWidth="2" />
          <rect x="4" y={groundY - 10} width="20" height="7" rx="2" fill="#3f3f46" />
          <rect x="7" y={groundY - 16} width="14" height="7" rx="2" fill="#52525b" />
          <line x1="19" y1={groundY - 14} x2="30" y2={groundY - 20} stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" />
          {[70, 96, 122, 148].map((mx, i) => (
            <g key={i}>
              <line x1={mx} y1={groundY} x2={mx} y2={groundY - 9} stroke="#52525b" strokeWidth="1.5" />
              <circle cx={mx} cy={groundY} r={3} fill="#27272a" stroke="#52525b" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      );
    }
    return (
      <div className="w-56">
        <div className="relative h-4 rounded-full bg-zinc-800 overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-emerald-600/30" style={{ width: "50%" }} />
          <div className="absolute top-1/2 -mt-3 w-2 h-6 rounded bg-zinc-500" style={{ left: "50%" }} />
        </div>
      </div>
    );
  }
  if (category === "wheel") {
    if (gameKey === "coinflip") {
      return <IconEagle className="w-24 h-24 drop-shadow-[0_0_20px_-4px_rgba(245,158,11,0.6)]" />;
    }
    const isRoulette = gameKey === "roulette";
    const colors = isRoulette
      ? ["#dc2626", "#18181b", "#dc2626", "#18181b", "#059669", "#18181b", "#dc2626", "#18181b"]
      : ["#3f3f46", "#f59e0b", "#3f3f46", "#f59e0b", "#3f3f46", "#dc2626"];
    const step = 360 / colors.length;
    const gradient = colors.map((c, i) => `${c} ${i * step}deg ${(i + 1) * step}deg`).join(", ");
    return <div className="w-28 h-28 rounded-full border-4 border-zinc-700" style={{ backgroundImage: `conic-gradient(${gradient})` }} />;
  }
  if (category === "board") {
    if (gameKey === "mines") {
      return (
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 25 }, (_, i) => <div key={i} className="w-9 h-9 rounded-md bg-zinc-800" />)}
        </div>
      );
    }
    if (gameKey === "tower") {
      return (
        <div className="flex flex-col-reverse gap-1 items-center">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="w-40 h-5 rounded-md bg-zinc-800" />)}
        </div>
      );
    }
    if (gameKey === "keno") {
      return (
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 24 }, (_, i) => <div key={i} className="w-7 h-7 rounded bg-zinc-800" />)}
        </div>
      );
    }
    if (gameKey === "golden-ticket") {
      return (
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-8 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-300/50 flex items-center justify-center text-amber-950 text-sm">
              ★
            </div>
          ))}
        </div>
      );
    }
    if (gameKey === "bingo") {
      return (
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => <div key={i} className="w-6 h-6 rounded bg-zinc-800" />)}
        </div>
      );
    }
    if (gameKey === "scratch-gold") {
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/40" />
          ))}
        </div>
      );
    }
    // plinko
    return (
      <div className="flex flex-col gap-2">
        {[4, 5, 6].map((count, row) => (
          <div key={row} className="flex justify-center gap-3">
            {Array.from({ length: count }, (_, c) => <span key={c} className="w-1.5 h-1.5 rounded-full bg-zinc-600" />)}
          </div>
        ))}
      </div>
    );
  }
  if (category === "cards") {
    return (
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <div key={i} className="w-16 h-[90px] rounded-md bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600" />
        ))}
      </div>
    );
  }
  return (
    <svg viewBox="0 0 200 100" width="200" height="100">
      <path d="M 10 90 Q 100 90, 190 20" stroke="#71717a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
