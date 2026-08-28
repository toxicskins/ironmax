"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { IconGem, IconMine, IconCoinFace } from "./icons";
import { themeFor } from "./theme";

type Phase = "setup" | "active" | "busted" | "cashed";
type Difficulty = { label: string; tilesPerRow: number; safeTiles: number };

const DIFFICULTIES: Difficulty[] = [
  { label: "Easy", tilesPerRow: 4, safeTiles: 3 },
  { label: "Medium", tilesPerRow: 3, safeTiles: 2 },
  { label: "Hard", tilesPerRow: 2, safeTiles: 1 },
  { label: "Expert", tilesPerRow: 4, safeTiles: 1 },
];
const ROWS = 8;

export function TowerInteractive({ minStake, maxStake, initialCoins }: {
  minStake: number; maxStake: number; initialCoins: number | null;
}) {
  const loggedIn = initialCoins !== null;
  const theme = themeFor("board");
  const [coins, setCoins] = useState(initialCoins ?? 0);
  const [stake, setStake] = useState(minStake);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [climbed, setClimbed] = useState<number[]>([]);
  const [bustFloor, setBustFloor] = useState<{ floor: number; tileIndex: number } | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(true);

  const nextMultiplier = Math.pow(difficulty.tilesPerRow / difficulty.safeTiles, climbed.length + 1) * 0.96;

  // Resume an in-progress climb after a refresh — the stake is already locked into it.
  useEffect(() => {
    if (!loggedIn) { setResuming(false); return; }
    fetch("/api/games/tower/active")
      .then((r) => r.json())
      .then((body) => {
        if (body.round) {
          setRoundId(body.round.roundId);
          setStake(body.round.stake);
          setDifficulty({
            label: "Resumed", tilesPerRow: body.round.tilesPerRow, safeTiles: body.round.safeTiles,
          });
          setClimbed(body.round.climbed);
          setPhase("active");
          setMultiplier(Math.pow(body.round.tilesPerRow / body.round.safeTiles, body.round.climbed.length) * 0.96);
        }
      })
      .finally(() => setResuming(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRound() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/tower/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stake, tilesPerRow: difficulty.tilesPerRow, safeTiles: difficulty.safeTiles,
        clientSeed: Math.random().toString(36).slice(2),
      }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Could not start climb"); return; }
    setRoundId(body.roundId);
    setClimbed([]);
    setBustFloor(null);
    setMultiplier(1);
    setCoins((c) => c - stake);
    setPhase("active");
  }

  async function pick(floor: number, tileIndex: number) {
    if (loading || phase !== "active" || floor !== climbed.length) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/tower/pick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId, tileIndex }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Pick failed"); return; }
    if (!body.safe) {
      setBustFloor({ floor, tileIndex });
      setPhase("busted");
    } else {
      setClimbed(body.climbed);
      setMultiplier(body.multiplier);
      if (body.atTop) cashOut();
    }
  }

  async function cashOut() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/tower/cashout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Cash out failed"); return; }
    setCoins((c) => c + body.payout);
    setPhase("cashed");
    if (body.payout > 0) {
      confetti({ particleCount: 90, spread: 75, startVelocity: 40, origin: { y: 0.55 }, colors: ["#10b981", "#34d399", "#f59e0b"] });
    }
  }

  function playAgain() {
    setPhase("setup");
    setRoundId(null);
    setClimbed([]);
    setBustFloor(null);
    setMultiplier(1);
  }

  const potentialPayout = Math.floor(stake * multiplier);
  // Floors render top-down (row 7 at the top of the tower) so climbing visually goes upward.
  const floorOrder = Array.from({ length: ROWS }, (_, i) => ROWS - 1 - i);

  return (
    <div className="flex flex-col">
      <div className="relative p-2 rounded-2xl bg-zinc-900">
        <div className="absolute top-0 left-3 right-3 h-1.5 marquee-lights rounded-full" />
        <div className="absolute bottom-0 left-3 right-3 h-1.5 marquee-lights rounded-full" style={{ animationDirection: "reverse" }} />
        <div
          className={`relative min-h-[42vh] sm:min-h-[62vh] rounded-xl border-2 flex flex-col items-center justify-center gap-3 overflow-hidden px-3 py-6 sm:px-4 sm:py-8 transition-colors duration-500 ${theme.border}`}
          style={{ background: theme.radial, boxShadow: `0 0 80px -20px ${theme.glow}` }}
        >
          {!loggedIn ? (
            <Link href="/login" className="text-amber-400 hover:underline font-medium">Log in to play</Link>
          ) : resuming ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : phase === "setup" ? (
            <p className="text-sm text-zinc-500 relative z-10">Choose a difficulty and stake, then press Start</p>
          ) : (
            <>
              <div className="flex flex-col gap-1.5 relative z-10 w-full">
                {floorOrder.map((floor) => {
                  const isCurrent = phase === "active" && floor === climbed.length;
                  const isCleared = floor < climbed.length;
                  const isBustFloor = bustFloor?.floor === floor;
                  const rowDimmed = floor > climbed.length && !isCurrent;
                  return (
                    <div
                      key={floor}
                      className={`flex gap-1.5 transition-opacity duration-300 ${rowDimmed ? "opacity-35" : "opacity-100"}`}
                    >
                      {Array.from({ length: difficulty.tilesPerRow }, (_, tileIndex) => {
                        const pickedHere = isCleared && climbed[floor] === tileIndex;
                        const bustedHere = isBustFloor && bustFloor.tileIndex === tileIndex;
                        const revealAsSafe = isBustFloor && !bustedHere; // show the safe tile too, once busted
                        return (
                          <motion.button
                            key={tileIndex}
                            type="button"
                            disabled={!isCurrent || loading}
                            onClick={() => pick(floor, tileIndex)}
                            whileTap={isCurrent ? { scale: 0.92 } : undefined}
                            animate={bustedHere ? { rotate: [0, -6, 6, 0] } : {}}
                            className={`flex-1 aspect-square rounded-lg flex items-center justify-center p-2 transition-colors ${
                              bustedHere
                                ? "bg-red-700"
                                : pickedHere
                                ? "bg-emerald-700"
                                : isCurrent
                                ? "bg-zinc-800 hover:bg-amber-500/20 ring-2 ring-amber-400/60 cursor-pointer"
                                : "bg-zinc-800"
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {(pickedHere || bustedHere) && (
                                <motion.div
                                  key={bustedHere ? "mine" : "gem"}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                  className="w-full h-full"
                                >
                                  {bustedHere ? <IconMine className="w-full h-full" /> : <IconGem className="w-full h-full" />}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {phase === "active" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className="text-sm text-zinc-400">
                    Floor {climbed.length + 1} of {ROWS} — pick the safe tile
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">{multiplier.toFixed(2)}x</div>
                  <div className="text-xs text-zinc-500">
                    {climbed.length === 0
                      ? `next floor pays ${nextMultiplier.toFixed(2)}x`
                      : `cash out now for ${potentialPayout} points, or climb for ${nextMultiplier.toFixed(2)}x`}
                  </div>
                </div>
              )}
              {phase === "busted" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <p className="text-2xl font-extrabold text-red-400">Fell — lost your stake</p>
                  <p className="text-sm text-zinc-500">Reached floor {climbed.length + 1} of {ROWS}</p>
                </div>
              )}
              {phase === "cashed" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <p className="text-2xl font-extrabold text-emerald-400">+{potentialPayout} points</p>
                  <p className="text-sm text-zinc-500">cashed out at {multiplier.toFixed(2)}x, floor {climbed.length}</p>
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
            <span className="text-xs text-zinc-500 w-24 shrink-0">Difficulty</span>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTIES.map((d) => (
                <button key={d.label} type="button" disabled={loading} onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                    difficulty.label === d.label ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}>
                  {d.label} ({d.safeTiles}/{d.tilesPerRow} safe)
                </button>
              ))}
            </div>
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
          disabled={loading || climbed.length === 0}
          className="mt-4 rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 font-extrabold text-lg tracking-wide py-3 shadow-[0_0_25px_-4px_rgba(16,185,129,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none"
        >
          {climbed.length === 0 ? "Pick a tile first" : `Cash out — ${potentialPayout} points`}
        </button>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
