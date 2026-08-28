"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { IconMine, IconGem, IconCoinFace } from "./icons";
import { themeFor } from "./theme";

type Phase = "setup" | "active" | "busted" | "cashed";

export function MinesInteractive({ minStake, maxStake, initialCoins }: {
  minStake: number; maxStake: number; initialCoins: number | null;
}) {
  const loggedIn = initialCoins !== null;
  const theme = themeFor("board");
  const [coins, setCoins] = useState(initialCoins ?? 0);
  const [stake, setStake] = useState(minStake);
  const [mineCount, setMineCount] = useState(5);
  const [phase, setPhase] = useState<Phase>("setup");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [hitIndex, setHitIndex] = useState<number | null>(null);
  const [grid, setGrid] = useState<boolean[] | null>(null); // revealed full layout, only after bust/cashout
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(true);

  // Resume an in-progress round after a refresh — the stake is already locked into it.
  useEffect(() => {
    if (!loggedIn) { setResuming(false); return; }
    fetch("/api/games/mines/active")
      .then((r) => r.json())
      .then((body) => {
        if (body.round) {
          setRoundId(body.round.roundId);
          setStake(body.round.stake);
          setMineCount(body.round.mineCount);
          setRevealed(body.round.revealed);
          setPhase("active");
          const safeOdds = 1 - body.round.mineCount / 25;
          setMultiplier(Math.pow(1 / safeOdds, body.round.revealed.length) * 0.96);
        }
      })
      .finally(() => setResuming(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tilesLeft = 25 - mineCount - revealed.length;
  const nextMultiplier = (() => {
    const safeOdds = 1 - mineCount / 25;
    return Math.pow(1 / safeOdds, revealed.length + 1) * 0.96;
  })();

  async function startRound() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/mines/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stake, mineCount, clientSeed: Math.random().toString(36).slice(2) }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Could not start round"); return; }
    setRoundId(body.roundId);
    setRevealed([]);
    setHitIndex(null);
    setGrid(null);
    setCoins((c) => c - stake);
    setPhase("active");
  }

  async function pick(index: number) {
    if (loading || phase !== "active" || revealed.includes(index)) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/mines/pick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId, index }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Pick failed"); return; }
    if (body.mine) {
      setHitIndex(index);
      setGrid(body.grid);
      setPhase("busted");
    } else {
      setRevealed(body.revealed);
      setMultiplier(body.multiplier);
      if (body.tilesLeft === 0) {
        // Every safe tile is already revealed — nothing left to lose, cash out automatically.
        cashOut();
      }
    }
  }

  async function cashOut() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/mines/cashout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Cash out failed"); return; }
    setGrid(body.grid);
    setCoins((c) => c + body.payout);
    setPhase("cashed");
    if (body.payout > 0) {
      confetti({ particleCount: 90, spread: 75, startVelocity: 40, origin: { y: 0.55 }, colors: ["#10b981", "#34d399", "#f59e0b"] });
    }
  }

  function playAgain() {
    setPhase("setup");
    setRoundId(null);
    setRevealed([]);
    setHitIndex(null);
    setGrid(null);
    setMultiplier(1);
  }

  const potentialPayout = Math.floor(stake * multiplier);

  return (
    <div className="flex flex-col">
      <div className="relative p-2 rounded-2xl bg-zinc-900">
        <div className="absolute top-0 left-3 right-3 h-1.5 marquee-lights rounded-full" />
        <div className="absolute bottom-0 left-3 right-3 h-1.5 marquee-lights rounded-full" style={{ animationDirection: "reverse" }} />
        <div
          className={`relative min-h-[42vh] sm:min-h-[62vh] rounded-xl border-2 flex flex-col items-center justify-center gap-5 overflow-hidden px-3 py-6 sm:px-4 sm:py-10 transition-colors duration-500 ${theme.border}`}
          style={{ background: theme.radial, boxShadow: `0 0 80px -20px ${theme.glow}` }}
        >
          {!loggedIn ? (
            <Link href="/login" className="text-amber-400 hover:underline font-medium">Log in to play</Link>
          ) : resuming ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2 sm:gap-3 relative z-10 w-full">
                {Array.from({ length: 25 }, (_, i) => {
                  const isRevealed = revealed.includes(i);
                  const isHit = hitIndex === i;
                  const finalIsMine = grid?.[i];
                  const showMine = isHit || (phase !== "active" && phase !== "setup" && finalIsMine && grid);
                  const showGem = isRevealed && !isHit;
                  return (
                    <motion.button
                      key={i}
                      type="button"
                      disabled={phase !== "active" || loading}
                      onClick={() => pick(i)}
                      whileTap={phase === "active" ? { scale: 0.92 } : undefined}
                      initial={false}
                      animate={showMine ? { rotate: [0, -6, 6, 0] } : {}}
                      className={`w-full aspect-square rounded-lg flex items-center justify-center p-2 transition-colors ${
                        showMine ? "bg-red-700" : showGem ? "bg-emerald-700" : "bg-zinc-800 hover:bg-zinc-700"
                      } ${phase === "active" && !isRevealed ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <AnimatePresence mode="wait">
                        {(showMine || showGem) && (
                          <motion.div
                            key={showMine ? "mine" : "gem"}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 18 }}
                            className="w-full h-full"
                          >
                            {showMine ? <IconMine className="w-full h-full" /> : <IconGem className="w-full h-full" />}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              {phase === "setup" && (
                <p className="text-sm text-zinc-500 relative z-10">Choose your mines and stake, then press Start</p>
              )}
              {phase === "active" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">{multiplier.toFixed(2)}x</div>
                  <div className="text-xs text-zinc-500">
                    {revealed.length === 0
                      ? `next pick pays ${nextMultiplier.toFixed(2)}x`
                      : `cash out now for ${potentialPayout} points, or pick again for ${nextMultiplier.toFixed(2)}x`}
                  </div>
                </div>
              )}
              {phase === "busted" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <p className="text-2xl font-extrabold text-red-400">Boom — lost your stake</p>
                  <p className="text-sm text-zinc-500">{revealed.length} tile{revealed.length === 1 ? "" : "s"} revealed safely first</p>
                </div>
              )}
              {phase === "cashed" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <p className="text-2xl font-extrabold text-emerald-400">+{potentialPayout} points</p>
                  <p className="text-sm text-zinc-500">cashed out at {multiplier.toFixed(2)}x</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {(phase === "busted" || phase === "cashed") && (
        <button
          onClick={playAgain}
          className="mt-4 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-lg tracking-wide py-3 shadow-[0_0_25px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition"
        >
          Play again
        </button>
      )}

      {phase === "setup" && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-zinc-500 w-24 shrink-0">Mines</span>
            <input type="range" min={1} max={24} value={mineCount} disabled={loading}
              onChange={(e) => setMineCount(Number(e.target.value))} className="flex-1 min-w-[120px]" />
            <span className="text-sm font-semibold text-amber-400 w-8">{mineCount}</span>
          </div>

          <div className="flex items-center gap-2.5 sm:pr-4">
            <IconCoinFace label="P" className="w-9 h-9 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">Balance</div>
              <div className="text-lg font-bold tabular-nums text-zinc-100">{coins.toLocaleString("en-US")}</div>
            </div>
            <div className="flex flex-col gap-1 ml-auto sm:w-40">
              <label className="text-[10px] uppercase tracking-wide text-zinc-500">Stake</label>
              <div className="flex items-center flex-1 rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden">
                <button type="button" disabled={loading} onClick={() => setStake((s) => Math.max(minStake, s - 1))}
                  className="w-10 h-full flex items-center justify-center text-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors">−</button>
                <input type="number" min={minStake} max={maxStake} value={stake} disabled={loading}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="w-full h-full text-center bg-transparent border-0 shadow-none font-bold text-lg tabular-nums" />
                <button type="button" disabled={loading} onClick={() => setStake((s) => Math.min(maxStake, s + 1))}
                  className="w-10 h-full flex items-center justify-center text-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors">+</button>
              </div>
            </div>
          </div>

          <button
            onClick={startRound}
            disabled={loading || !loggedIn || stake > coins}
            className="rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-lg tracking-wide py-3 shadow-[0_0_25px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? "Starting…" : "Start"}
          </button>
          {loggedIn && stake > coins && <p className="text-amber-400 text-sm">Not enough points for this stake.</p>}
        </div>
      )}

      {phase === "active" && (
        <button
          onClick={cashOut}
          disabled={loading || revealed.length === 0}
          className="mt-4 rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 font-extrabold text-lg tracking-wide py-3 shadow-[0_0_25px_-4px_rgba(16,185,129,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none"
        >
          {revealed.length === 0 ? "Pick a tile first" : `Cash out — ${potentialPayout} points`}
        </button>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
