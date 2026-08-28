"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CardRow, CardBack } from "./GameResultView";
import { IconCoinFace } from "./icons";
import { themeFor } from "./theme";

type Phase = "setup" | "active" | "finished";
type Bet = "player" | "banker" | "tie";

const BET_LABELS: Record<Bet, string> = {
  player: "Player (2.13x)", banker: "Banker (2.13x)", tie: "Tie (9.7x)",
};

export function BaccaratInteractive({ minStake, maxStake, initialCoins }: {
  minStake: number; maxStake: number; initialCoins: number | null;
}) {
  const loggedIn = initialCoins !== null;
  const theme = themeFor("cards");
  const [coins, setCoins] = useState(initialCoins ?? 0);
  const [stake, setStake] = useState(minStake);
  const [phase, setPhase] = useState<Phase>("setup");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [player, setPlayer] = useState<string[]>([]);
  const [banker, setBanker] = useState<string[] | null>(null);
  const [pv, setPv] = useState<number | null>(null);
  const [bv, setBv] = useState<number | null>(null);
  const [bet, setBet] = useState<Bet | null>(null);
  const [winner, setWinner] = useState<Bet | null>(null);
  const [payout, setPayout] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(true);

  // Resume an in-progress round after a refresh — the stake is already locked into it.
  useEffect(() => {
    if (!loggedIn) { setResuming(false); return; }
    fetch("/api/games/baccarat/active")
      .then((r) => r.json())
      .then((body) => {
        if (body.round) {
          setRoundId(body.round.roundId);
          setStake(body.round.stake);
          setPlayer(body.round.player);
          setPhase("active");
        }
      })
      .finally(() => setResuming(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRound() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/baccarat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stake, clientSeed: Math.random().toString(36).slice(2) }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Could not start round"); return; }
    setRoundId(body.roundId);
    setPlayer(body.player);
    setBanker(null);
    setBet(null);
    setPv(null);
    setBv(null);
    setCoins((c) => c - stake);
    setPhase("active");
  }

  async function placeBet(b: Bet) {
    if (loading) return;
    setLoading(true);
    setError(null);
    setBet(b);
    const res = await fetch("/api/games/baccarat/pick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId, bet: b }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Bet failed"); return; }
    setPlayer(body.player);
    setBanker(body.banker);
    setPv(body.pv);
    setBv(body.bv);
    setWinner(body.winner);
    setPayout(body.payout);
    setCoins((c) => c + body.payout);
    setPhase("finished");
    if (body.payout > stake) {
      confetti({ particleCount: 90, spread: 75, startVelocity: 40, origin: { y: 0.55 }, colors: ["#10b981", "#34d399", "#f59e0b"] });
    }
  }

  function playAgain() {
    setPhase("setup");
    setRoundId(null);
    setPlayer([]);
    setBanker(null);
    setBet(null);
    setWinner(null);
  }

  return (
    <div className="flex flex-col">
      <div className="relative p-2 rounded-2xl bg-zinc-900">
        <div className="absolute top-0 left-3 right-3 h-1.5 marquee-lights rounded-full" />
        <div className="absolute bottom-0 left-3 right-3 h-1.5 marquee-lights rounded-full" style={{ animationDirection: "reverse" }} />
        <div
          className={`relative min-h-[42vh] sm:min-h-[62vh] rounded-xl border-2 flex flex-col items-center justify-center gap-6 overflow-hidden px-3 py-6 sm:px-4 sm:py-10 transition-colors duration-500 ${theme.border}`}
          style={{ background: theme.radial, boxShadow: `0 0 80px -20px ${theme.glow}` }}
        >
          {!loggedIn ? (
            <Link href="/login" className="text-amber-400 hover:underline font-medium">Log in to play</Link>
          ) : resuming ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : phase === "setup" ? (
            <p className="text-sm text-zinc-500 relative z-10">Choose your stake, then press Deal</p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2 relative z-10">
                <CardRow cards={player} resultKey={`${roundId}-player-${player.length}`} />
                <div className="text-sm text-zinc-400 font-medium">You{pv !== null ? ` (${pv})` : ""}</div>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                {banker ? (
                  <CardRow cards={banker} resultKey={`${roundId}-banker-${banker.length}`} />
                ) : (
                  <div className="flex gap-2 sm:gap-3">
                    <CardBack index={0} />
                    <CardBack index={1} />
                  </div>
                )}
                <div className="text-sm text-zinc-400 font-medium">Banker{bv !== null ? ` (${bv})` : ""}</div>
              </div>

              {phase === "finished" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <p className={`text-2xl font-extrabold ${payout > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {payout > 0 ? `+${payout} points` : "No win this time"}
                  </p>
                  <p className="text-sm text-zinc-500 capitalize">
                    {winner === "tie" ? "Tie" : `${winner} wins`} — you bet {bet}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {phase === "finished" && (
        <button
          onClick={playAgain}
          className="mt-4 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-lg tracking-wide py-3 shadow-[0_0_25px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition"
        >
          Play again
        </button>
      )}

      {phase === "setup" && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 flex flex-col gap-4">
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
            {loading ? "Dealing…" : "Deal"}
          </button>
          {loggedIn && stake > coins && <p className="text-amber-400 text-sm">Not enough points for this stake.</p>}
        </div>
      )}

      {phase === "active" && (
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {(["player", "banker", "tie"] as const).map((b) => (
            <button
              key={b}
              onClick={() => placeBet(b)}
              disabled={loading}
              className="rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-sm sm:text-base tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
            >
              {BET_LABELS[b]}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
