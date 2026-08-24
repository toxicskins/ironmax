"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as deck from "@letele/playing-cards";
import {
  IconSeven, IconBar, IconBell, IconCherry, IconLemon, IconGrape,
  IconWatermelon, IconOrange, IconPlum, IconStar, IconMine, IconGem, IconCoinFace,
} from "./icons";

const SYMBOL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "7": IconSeven, BAR: IconBar, BELL: IconBell, CHERRY: IconCherry, LEMON: IconLemon,
  GRAPE: IconGrape, WATERMELON: IconWatermelon, ORANGE: IconOrange, PLUM: IconPlum, STAR: IconStar,
};

// @letele/playing-cards names cards as <SuitLetter><rankLetter>, e.g. "Sk" = King of Spades.
const SUIT_LETTER: Record<string, string> = { "♠": "S", "♥": "H", "♦": "D", "♣": "C" };
const RANK_LETTER: Record<string, string> = { J: "j", Q: "q", K: "k", A: "a" };

function Card({ card, index, resultKey }: { card: string; index: number; resultKey: string }) {
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
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ delay: index * 0.15, duration: 0.4, ease: "easeOut" }}
    >
      <Face style={{ width: "100%", height: "100%" }} />
    </motion.div>
  );
}

function CardRow({ cards, resultKey }: { cards: string[]; resultKey: string }) {
  return <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">{cards.map((c, i) => <Card key={i} card={c} index={i} resultKey={resultKey} />)}</div>;
}

const ALL_SLOT_SYMBOLS = Object.keys(SYMBOL_ICON);

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
    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-zinc-950 border-2 border-amber-500/30 shadow-[0_0_20px_-4px_rgba(245,158,11,0.5)] overflow-hidden flex items-center justify-center">
      <motion.div
        key={resultKey}
        className="flex flex-col items-center"
        initial={{ y: 0 }}
        animate={{ y: -(strip.length - 1) * itemSize }}
        transition={{ delay, duration, ease: [0.12, 0.8, 0.2, 1] }}
      >
        {strip.map((s, i) => {
          const SIcon = SYMBOL_ICON[s];
          return (
            <div key={i} className="w-28 h-28 shrink-0 flex items-center justify-center">
              {SIcon ? <SIcon className="w-full h-full" /> : s}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/** A real conic-gradient wheel that spins several full turns and settles with `targetIndex`'s segment under the fixed top pointer. */
function SpinWheel({ segments, targetIndex, resultKey, size = 300 }: {
  segments: { label: string; color: string; textColor?: string }[];
  targetIndex: number;
  resultKey: string;
  size?: number;
}) {
  const n = segments.length;
  const step = 360 / n;
  const gradient = segments.map((s, i) => `${s.color} ${i * step}deg ${(i + 1) * step}deg`).join(", ");
  const targetAngle = 8 * 360 - (targetIndex * step + step / 2);
  const showLabels = n <= 8;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative drop-shadow-[0_0_40px_-8px_rgba(245,158,11,0.6)]" style={{ width: size, height: size }}>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-amber-400" />
        <motion.div
          key={resultKey}
          className="w-full h-full rounded-full border-[6px] border-zinc-700 relative"
          style={{ backgroundImage: `conic-gradient(${gradient})` }}
          initial={{ rotate: 0 }}
          animate={{ rotate: targetAngle }}
          transition={{ duration: 4, ease: [0.14, 0.9, 0.2, 1] }}
        >
          {showLabels && segments.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 flex justify-center"
              style={{ transform: `rotate(${i * step + step / 2}deg)` }}
            >
              <span
                className="text-base sm:text-lg font-bold mt-4"
                style={{ color: s.textColor ?? "#fff" }}
              >
                {s.label}
              </span>
            </div>
          ))}
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
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-[6px] border-amber-200 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-zinc-950" style={{ backfaceVisibility: "hidden" }}>
          HEADS
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 border-[6px] border-zinc-100 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-zinc-950" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          TAILS
        </div>
      </motion.div>
    </div>
  );
}

// Mirrors the payout table in src/lib/games/registry.ts (plinko) — display-only, not re-derived from the server.
const PLINKO_PAYOUTS = [0.36, 0.72, 0.96, 1.68, 3.6, 8.9, 43.2];

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

/** A rising flight path to the crash point, with a fixed 2x cashout marker so the outcome reads at a glance. */
function CrashGraph({ crashPoint, resultKey }: { crashPoint: number; resultKey: string }) {
  const won = crashPoint >= 2;
  const width = 420, height = 220;
  const clampedMult = Math.min(crashPoint, 12);
  const endX = width - 24;
  const endY = height - 16 - Math.min(height - 40, Math.log2(clampedMult + 1) * 64);
  const path = `M 14 ${height - 16} Q ${width * 0.5} ${height - 16}, ${endX} ${endY}`;
  const cashoutY = height - 16 - Math.log2(2 + 1) * 64;
  const color = won ? "#34d399" : "#f87171";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="w-3 h-px bg-zinc-500" style={{ borderTop: "1px dashed #a1a1aa" }} />
        Fixed cash-out target: <span className="font-bold text-zinc-200">2.00x</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="overflow-visible max-w-full">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="14" y1={height - 16 - f * (height - 40)} x2={width - 14} y2={height - 16 - f * (height - 40)} stroke="#27272a" strokeWidth="1" />
        ))}
        <line x1="14" y1={cashoutY} x2={width - 14} y2={cashoutY} stroke="#a1a1aa" strokeDasharray="5 5" strokeWidth="1.5" />
        <motion.path
          key={resultKey}
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeIn" }}
        />
        <motion.circle
          key={`${resultKey}-dot`}
          r="6"
          fill={color}
          initial={{ cx: 10, cy: height - 10 }}
          animate={{ cx: endX, cy: endY }}
          transition={{ duration: 1.4, ease: "easeIn" }}
        />
      </svg>
      <div className={`text-4xl sm:text-5xl font-extrabold ${won ? "text-emerald-400" : "text-red-400"}`} style={{ filter: `drop-shadow(0 0 20px ${color})` }}>
        ×{crashPoint.toFixed(2)}
      </div>
    </div>
  );
}

const WHEEL_SEGMENTS = [
  { label: "0x", color: "#3f3f46", mult: 0 }, { label: "1x", color: "#f59e0b", mult: 1 },
  { label: "1.3x", color: "#3f3f46", mult: 1.3 }, { label: "1.8x", color: "#f59e0b", mult: 1.8 },
  { label: "3.5x", color: "#3f3f46", mult: 3.5 }, { label: "12x", color: "#dc2626", mult: 12 },
];
const ROULETTE_RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
// Real European single-zero wheel order (not sequential 0–36) — using plain 0..36 order made
// same-color numbers cluster next to each other on the drawn wheel, which read as "duplicate"
// segments even though every number is still only there once.
const ROULETTE_WHEEL_ORDER = [
  0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26,
];

export function GameResultView({ category, gameKey, detail, win }: { category: string; gameKey: string; detail: Record<string, unknown>; win: boolean }) {
  const resultKey = JSON.stringify(detail);

  switch (category) {
    case "slots": {
      const reels = detail.reels as string[];
      return <div className="flex gap-3 sm:gap-4 justify-center">{reels.map((s, i) => <Reel key={i} symbol={s} index={i} resultKey={resultKey} />)}</div>;
    }
    case "dice": {
      const roll = detail.roll as number;
      const targetBp = detail.targetBp as number;

      // Limbo: same underlying roll/target as Dice Roll, but framed as "how high did the
      // multiplier climb" (a rocket-to-target readout) instead of a roll-under progress bar —
      // the two games share math but shouldn't look identical.
      if (gameKey === "limbo") {
        const targetMult = 9600 / Math.max(targetBp, 1);
        const rolledMult = 9600 / Math.max(roll, 1);
        return (
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <motion.div
              key={resultKey}
              initial={{ y: 60, scale: 0.7, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className={`text-5xl font-extrabold tabular-nums ${win ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]" : "text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]"}`}
            >
              ↑ {rolledMult.toFixed(2)}x
            </motion.div>
            <div className="w-full text-sm text-zinc-500 flex justify-between">
              <span>target: <span className="text-zinc-300 font-semibold">{targetMult.toFixed(2)}x</span></span>
              <span>{win ? "cleared" : "missed"}</span>
            </div>
          </div>
        );
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
        return <CardRow cards={[detail.current as string, detail.nextCard as string]} resultKey={resultKey} />;
      }
      if ("hand" in detail) {
        return <CardRow cards={detail.hand as string[]} resultKey={resultKey} />;
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
      return (
        <div className="flex flex-col gap-5 items-center">
          <div>
            <div className="text-sm text-zinc-400 mb-2 text-center font-medium">Player ({String(detail.pv)})</div>
            <CardRow cards={detail.player as string[]} resultKey={resultKey} />
          </div>
          <div>
            <div className="text-sm text-zinc-400 mb-2 text-center font-medium">Banker ({String(detail.bv)})</div>
            <CardRow cards={detail.banker as string[]} resultKey={`${resultKey}-b`} />
          </div>
          <div className="text-amber-400 text-base font-bold capitalize">{String(detail.winner)} wins</div>
        </div>
      );
    }
    case "crash": {
      return <CrashGraph crashPoint={detail.crashPoint as number} resultKey={resultKey} />;
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
      return (
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-4 border-amber-200 flex items-center justify-center text-sm font-extrabold text-zinc-950 drop-shadow-[0_0_20px_-4px_rgba(245,158,11,0.6)]">
          HEADS
        </div>
      );
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
  // crash
  return (
    <svg viewBox="0 0 200 100" width="200" height="100">
      <path d="M 10 90 Q 100 90, 190 20" stroke="#71717a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
