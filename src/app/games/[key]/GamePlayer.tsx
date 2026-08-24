"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import SlotCounter from "react-slot-counter";
import { GameResultView, IdlePreview } from "./GameResultView";
import { IconCoinFace } from "./icons";
import { themeFor } from "./theme";
import { BetControls, type BetParams } from "./BetControls";

type BetResponse = {
  payout: number;
  netDelta: number;
  multiplier: number;
  detail: Record<string, unknown>;
  fairness: { serverSeed: string; clientSeed: string; nonce: number };
};

// How long each category's GameResultView animation takes to settle, so the win/loss
// banner never spoils the outcome before the player has watched it play out.
const REVEAL_DELAY_MS: Record<string, number> = {
  slots: 3800, dice: 1700, wheel: 4200, board: 2000, cards: 1400, crash: 1800,
};

const GAMES_WITH_CONTROLS = new Set(["dice", "limbo", "coinflip", "roulette", "mines", "tower", "keno"]);

function chipAmounts(min: number, max: number) {
  const raw = [min, min * 5, min * 25, max];
  return [...new Set(raw.map((v) => Math.min(Math.max(v, min), max)))];
}

function Chip({ amount, active, onClick }: { amount: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 w-12 h-12 sm:w-[3.75rem] sm:h-[3.75rem] rounded-full flex items-center justify-center text-xs sm:text-sm font-extrabold transition-transform ${
        active ? "scale-110" : "hover:scale-105 hover:brightness-125"
      }`}
      style={{
        background: active
          ? "repeating-conic-gradient(#fbbf24 0deg 18deg, #92400e 18deg 36deg)"
          : "repeating-conic-gradient(#52525b 0deg 18deg, #27272a 18deg 36deg)",
        boxShadow: active
          ? "0 0 22px -2px rgba(245,158,11,0.95), 0 0 0 2px rgba(245,158,11,0.4)"
          : "0 2px 6px -2px rgba(0,0,0,0.6)",
      }}
    >
      <span className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 border-dashed ${active ? "bg-amber-950 text-amber-300 border-amber-700/50" : "bg-zinc-900 text-zinc-300 border-zinc-700"}`}>
        {amount}
      </span>
    </button>
  );
}

export function GamePlayer({
  gameKey, category, minStake, maxStake, initialCoins,
}: {
  gameKey: string; category: string; minStake: number; maxStake: number;
  initialCoins: number | null;
}) {
  const loggedIn = initialCoins !== null;
  const [stake, setStake] = useState(minStake);
  const [coins, setCoins] = useState(initialCoins ?? 0);
  const [clientSeed] = useState(() => Math.random().toString(36).slice(2));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BetResponse | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chips = chipAmounts(minStake, maxStake);
  const theme = themeFor(category);
  const balance = coins;
  const [betParams, setBetParams] = useState<BetParams>({});
  const spinning = loading || (result !== null && !revealed);

  async function play() {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setRevealed(false);
    setLoading(true);
    setError(null);
    const res = await fetch("/api/bet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey, stake, clientSeed, params: betParams }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Bet failed"); return; }
    setResult(body);

    const delay = REVEAL_DELAY_MS[category] ?? 1500;
    revealTimer.current = setTimeout(() => {
      setRevealed(true);
      setCoins((c) => c + body.netDelta);
      if (body.netDelta > 0) {
        const big = body.payout >= stake * 5;
        confetti({
          particleCount: big ? 160 : 70,
          spread: big ? 100 : 70,
          startVelocity: big ? 55 : 35,
          origin: { y: 0.55 },
          colors: ["#f59e0b", "#fde68a", "#dc2626", "#10b981"],
        });
      }
    }, delay);
  }

  useEffect(() => () => { if (revealTimer.current) clearTimeout(revealTimer.current); }, []);

  return (
    <div className="flex flex-col">
      {/* Stage: the big, near-fullscreen felt table, framed with chasing marquee bulbs like a real cabinet */}
      <div className="relative p-2 rounded-2xl bg-zinc-900">
        <div className="absolute top-0 left-3 right-3 h-1.5 marquee-lights rounded-full" />
        <div className="absolute bottom-0 left-3 right-3 h-1.5 marquee-lights rounded-full" style={{ animationDirection: "reverse" }} />
        <div className="absolute left-0 top-3 bottom-3 w-1.5 marquee-lights-v rounded-full" />
        <div className="absolute right-0 top-3 bottom-3 w-1.5 marquee-lights-v rounded-full" style={{ animationDirection: "reverse" }} />

        <div
          className={`relative min-h-[42vh] sm:min-h-[62vh] rounded-xl border-2 flex items-center justify-center overflow-hidden px-3 py-6 sm:px-4 sm:py-10 transition-colors duration-500 ${
            revealed && result && result.netDelta > 0 ? "border-emerald-400/50" : theme.border
          }`}
          style={{
            background: theme.radial,
            boxShadow: revealed && result && result.netDelta > 0 ? "0 0 100px -10px rgba(16,185,129,0.45)" : `0 0 80px -20px ${theme.glow}`,
          }}
        >
          {/* faint dot-grid so the stage reads as a textured table felt, not a flat gradient */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.15]"
            style={{ backgroundImage: `radial-gradient(circle, ${theme.glow} 1.5px, transparent 1.5px)`, backgroundSize: "26px 26px" }}
          />
          {/* soft diagonal sheen for depth */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.08]"
            style={{ backgroundImage: `linear-gradient(135deg, ${theme.glow} 0%, transparent 30%, transparent 70%, ${theme.glow} 100%)` }}
          />
          {/* drifting ambient sparkles for texture */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[10, 25, 40, 55, 70, 85, 15, 60, 90].map((left, i) => (
              <span
                key={i}
                className="sparkle absolute bottom-0 w-1 h-1 rounded-full bg-amber-300/70"
                style={{ left: `${left}%`, animationDelay: `${i * 0.35}s`, animationDuration: `${2.6 + (i % 3)}s` }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

          {loading ? (
            <div className="relative z-10 flex flex-col items-center gap-4">
              <motion.div
                animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.96, 1, 0.96] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="opacity-70"
              >
                <IdlePreview category={category} gameKey={gameKey} />
              </motion.div>
              <p className="text-sm font-medium tracking-wide text-zinc-400 uppercase">Rolling…</p>
            </div>
          ) : result ? (
            <div className="relative z-10 flex flex-col items-center gap-6 w-full">
              <GameResultView category={category} gameKey={gameKey} detail={result.detail} win={result.netDelta > 0} />

              {!revealed && (
                <motion.p
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  className="text-sm font-medium tracking-wide text-zinc-400 uppercase"
                >
                  Spinning…
                </motion.p>
              )}

              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className={`rounded-2xl px-8 py-4 border-2 ${
                      result.netDelta > 0
                        ? "bg-emerald-950/80 border-emerald-400/60 shadow-[0_0_40px_-6px_rgba(16,185,129,0.7)]"
                        : "bg-zinc-950/80 border-red-500/40 shadow-[0_0_30px_-6px_rgba(239,68,68,0.4)]"
                    }`}
                  >
                    <p className={`text-2xl sm:text-3xl font-extrabold text-center ${result.netDelta > 0 ? "text-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.6)]" : "text-red-400"}`}>
                      {result.netDelta > 0 ? (
                        <span className="inline-flex items-baseline gap-1.5">
                          +<SlotCounter value={result.payout} duration={0.7} /> points
                        </span>
                      ) : result.payout > 0 ? (
                        <span className="inline-flex items-baseline gap-1.5 text-xl sm:text-2xl">
                          Partial return: <SlotCounter value={result.payout} duration={0.7} /> points
                        </span>
                      ) : "No win this time"}
                    </p>
                    <div className="flex justify-center mt-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        result.netDelta >= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                      }`}>
                        <IconCoinFace label="" className="w-4 h-4" />
                        {result.netDelta >= 0 ? "+" : ""}{result.netDelta} points net
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="opacity-70">
                <IdlePreview category={category} gameKey={gameKey} />
              </div>
              <p className="text-sm text-zinc-500">Place your stake and press Play</p>
            </div>
          )}
        </div>
      </div>

      {/* What you're actually betting on — target %, heads/tails, mine count, etc. */}
      {GAMES_WITH_CONTROLS.has(gameKey) && (
        <div className={`mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 ${spinning ? "opacity-50 pointer-events-none" : ""}`}>
          <BetControls gameKey={gameKey} onChange={setBetParams} />
        </div>
      )}

      {/* Betting rail: balance, chips, stake, and the play button — laid out like a real casino table */}
      <div className={`mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-4 ${spinning ? "opacity-75" : ""}`}>
        <div className="flex items-center gap-2.5 sm:pr-4">
          <IconCoinFace label="P" className="w-9 h-9 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">Balance</div>
            {loggedIn ? (
              <div className="text-lg font-bold tabular-nums text-zinc-100">{balance.toLocaleString("en-US")}</div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-amber-400 hover:underline">Log in to play</Link>
            )}
          </div>
        </div>

        <div className="hidden sm:block w-px self-stretch bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar -mx-3 px-3 -my-3 py-3">
          {chips.map((amount) => (
            <Chip key={amount} amount={amount} active={stake === amount} onClick={() => setStake(amount)} />
          ))}
        </div>

        <div className="hidden sm:block w-px self-stretch bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />

        <div className="flex flex-col gap-1 sm:w-40">
          <label className="text-[10px] uppercase tracking-wide text-zinc-500">Stake</label>
          <div className="flex items-center flex-1 rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden">
            <button type="button" onClick={() => setStake((s) => Math.max(minStake, s - 1))}
              className="w-10 h-full flex items-center justify-center text-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors">
              −
            </button>
            <input type="number" min={minStake} max={maxStake} value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full h-full text-center bg-transparent border-0 shadow-none font-bold text-lg tabular-nums" />
            <button type="button" onClick={() => setStake((s) => Math.min(maxStake, s + 1))}
              className="w-10 h-full flex items-center justify-center text-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors">
              +
            </button>
          </div>
        </div>

        <button onClick={play} disabled={spinning || !loggedIn || stake > balance}
          className="flex-1 sm:min-w-[160px] rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-lg tracking-wide py-3 shadow-[0_0_25px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none">
          {spinning ? "Rolling…" : "PLAY"}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      {loggedIn && stake > balance && (
        <p className="text-amber-400 text-sm mt-3">Not enough points for this stake.</p>
      )}

      {result && revealed && (
        <p className="mt-3 text-xs text-zinc-600">
          Fair check — server seed: {result.fairness.serverSeed.slice(0, 16)}… nonce: {result.fairness.nonce}
        </p>
      )}
    </div>
  );
}
