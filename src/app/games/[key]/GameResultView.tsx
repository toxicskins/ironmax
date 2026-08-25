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

// Mirrors the weighted segment list in src/lib/games/registry.ts (wheel) exactly — value AND
// weight — so the wedge each color/size represents on screen matches the real server odds.
// Grey = a loss or a small win (<=1.5x), yellow = a solid win, red = a rare jackpot.
// Only 3 distinct values / 2 distinct sizes — see the comment in registry.ts's wheel entry for
// why (a wheel with many odd-sized wedges reads as clutter, not a wheel).
// All 12 wedges equal size now — see the comment in registry.ts's wheel entry for why the
// jackpot is a modest 7.52x rather than something flashier: that's the real ceiling a single
// 1-in-12 segment can pay without the other 11 segments' odds becoming fake.
const WHEEL_SEGMENTS = [
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "1.2x", color: "#f59e0b", mult: 1.2 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "1.2x", color: "#f59e0b", mult: 1.2 },
  { label: "1.2x", color: "#f59e0b", mult: 1.2 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "1.2x", color: "#f59e0b", mult: 1.2 },
  { label: "0x", color: "#71717a", mult: 0 },
  { label: "1.2x", color: "#f59e0b", mult: 1.2 },
  { label: "5.52x", color: "#dc2626", mult: 5.52 },
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
