"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CardRow, CardBack } from "./GameResultView";
import { IconCoinFace } from "./icons";
import { themeFor } from "./theme";

type Street = "preflop" | "flop" | "turn" | "river";
type Phase = "setup" | "active" | "finished";

// Same striped casino-chip look as the bet rail on every other game (GamePlayer.tsx's Chip) —
// duplicated rather than imported since that one isn't exported and this component stays
// self-contained like the other *Interactive.tsx games.
function chipAmounts(min: number, max: number) {
  const raw = [min, min * 5, min * 25, max];
  return [...new Set(raw.map((v) => Math.min(Math.max(v, min), max)))];
}

function Chip({ amount, active, onClick, disabled }: { amount: number; active: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative shrink-0 w-12 h-12 sm:w-[3.75rem] sm:h-[3.75rem] rounded-full flex items-center justify-center text-xs sm:text-sm font-extrabold transition-transform disabled:opacity-40 ${
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

export function HoldemInteractive({ minStake, maxStake, initialCoins }: {
  minStake: number; maxStake: number; initialCoins: number | null;
}) {
  const loggedIn = initialCoins !== null;
  const theme = themeFor("cards");
  const [coins, setCoins] = useState(initialCoins ?? 0);
  const [stake, setStake] = useState(minStake);
  const [phase, setPhase] = useState<Phase>("setup");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [player, setPlayer] = useState<string[]>([]);
  const [bot, setBot] = useState<string[] | null>(null);
  const [community, setCommunity] = useState<string[]>([]);
  const [street, setStreet] = useState<Street>("preflop");
  const [pot, setPot] = useState(0);
  const [toCall, setToCall] = useState(0);
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [raisesThisStreet, setRaisesThisStreet] = useState(0);
  const [winner, setWinner] = useState<"player" | "bot" | "split" | null>(null);
  const [payout, setPayout] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(true);

  // Resume an in-progress hand after a refresh — chips already committed are already locked in.
  useEffect(() => {
    if (!loggedIn) { setResuming(false); return; }
    fetch("/api/games/video-poker/active")
      .then((r) => r.json())
      .then((body) => {
        if (body.round) {
          setRoundId(body.round.roundId);
          setStake(body.round.stake);
          setPlayer(body.round.player);
          setCommunity(body.round.community);
          setStreet(body.round.street);
          setPot(body.round.pot);
          setToCall(body.round.toCall);
          setRaiseAmount(body.round.toCall + body.round.stake);
          setRaisesThisStreet(body.round.raisesThisStreet);
          setPhase("active");
        }
      })
      .finally(() => setResuming(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRound() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/video-poker/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stake, clientSeed: Math.random().toString(36).slice(2) }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Could not start hand"); return; }
    setRoundId(body.roundId);
    setPlayer(body.player);
    setBot(null);
    setCommunity([]);
    setStreet(body.street);
    setPot(body.pot);
    setToCall(body.toCall);
    setRaiseAmount(body.toCall + stake);
    setRaisesThisStreet(body.raisesThisStreet);
    setWinner(null);
    setCoins((c) => c - stake);
    setPhase("active");
  }

  async function act(action: "fold" | "check" | "call" | "raise" | "allin") {
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/video-poker/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId, action, ...(action === "raise" ? { amount: raiseAmount } : {}) }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Action failed"); return; }
    setPot(body.pot);
    setToCall(body.toCall);
    setRaiseAmount(body.toCall + stake);
    setStreet(body.street);
    setRaisesThisStreet(body.raisesThisStreet);
    setCommunity(body.community);
    // Every chip debited this action already left the wallet server-side; only a finished
    // hand's payout comes back in, so mid-hand actions only ever subtract from the shown balance.
    const spent = action === "call" ? toCall : action === "raise" ? raiseAmount : action === "allin" ? coins : 0;
    setCoins((c) => c - spent + (body.finished ? body.payout : 0));
    if (body.finished) {
      setBot(body.bot);
      setWinner(body.winner);
      setPayout(body.payout);
      setPhase("finished");
      if (body.payout > body.playerCommitted) {
        confetti({ particleCount: 90, spread: 75, startVelocity: 40, origin: { y: 0.55 }, colors: ["#10b981", "#34d399", "#f59e0b"] });
      }
    }
  }

  function playAgain() {
    setPhase("setup");
    setRoundId(null);
    setPlayer([]);
    setBot(null);
    setCommunity([]);
    setWinner(null);
  }

  const streetLabel: Record<Street, string> = { preflop: "Pre-flop", flop: "Flop", turn: "Turn", river: "River" };

  return (
    <div className="flex flex-col">
      <div className="relative p-2 rounded-2xl bg-zinc-900">
        <div className="absolute top-0 left-3 right-3 h-1.5 marquee-lights rounded-full" />
        <div className="absolute bottom-0 left-3 right-3 h-1.5 marquee-lights rounded-full" style={{ animationDirection: "reverse" }} />
        <div
          className={`relative min-h-[42vh] sm:min-h-[62vh] rounded-xl border-2 flex flex-col items-center justify-between gap-4 overflow-hidden px-3 py-6 sm:px-4 sm:py-8 transition-colors duration-500 ${theme.border}`}
          style={{ background: theme.radial, boxShadow: `0 0 80px -20px ${theme.glow}` }}
        >
          {!loggedIn ? (
            <div className="m-auto"><Link href="/login" className="text-amber-400 hover:underline font-medium">Log in to play</Link></div>
          ) : resuming ? (
            <p className="m-auto text-sm text-zinc-500">Loading…</p>
          ) : phase === "setup" ? (
            <p className="m-auto text-sm text-zinc-500 relative z-10">Choose your ante, then sit down</p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className="flex gap-2 sm:gap-3">
                  {bot ? <CardRow cards={bot} resultKey={`${roundId}-bot`} /> : (
                    <><CardBack index={0} /><CardBack index={1} /></>
                  )}
                </div>
                <div className="text-sm text-zinc-400 font-medium">Bot</div>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="text-xs uppercase tracking-wide text-zinc-500">{streetLabel[street]} · Pot {pot}</div>
                <div className="flex gap-2 sm:gap-3 min-h-[70px] sm:min-h-[120px] items-center">
                  {community.length > 0 ? (
                    <CardRow cards={community} resultKey={`${roundId}-board-${community.length}`} />
                  ) : (
                    <span className="text-sm text-zinc-500">No community cards yet</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 relative z-10">
                <CardRow cards={player} resultKey={`${roundId}-player`} />
                <div className="text-sm text-zinc-400 font-medium">You</div>
              </div>

              {phase === "finished" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <p className={`text-2xl font-extrabold ${payout > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {winner === "player" ? `+${payout} points` : winner === "split" ? `Split pot — +${payout} points` : "Bot wins this hand"}
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
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:pr-4">
            <IconCoinFace label="P" className="w-9 h-9 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">Balance</div>
              <div className="text-lg font-bold tabular-nums text-zinc-100">{coins.toLocaleString("en-US")}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar -mx-3 px-6 -my-6 py-6">
            {chipAmounts(minStake, maxStake).map((amount) => (
              <Chip key={amount} amount={amount} active={stake === amount} disabled={loading || amount > coins}
                onClick={() => setStake(amount)} />
            ))}
          </div>

          <div className="hidden sm:block w-px self-stretch bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />

          <div className="flex flex-col gap-1 sm:w-40">
            <label className="text-[10px] uppercase tracking-wide text-zinc-500">Ante</label>
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

          <button
            onClick={startRound}
            disabled={loading || !loggedIn || stake > coins}
            className="flex-1 sm:min-w-[160px] rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-lg tracking-wide py-3 shadow-[0_0_25px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? "Dealing…" : "Sit down"}
          </button>
        </div>
      )}
      {phase === "setup" && loggedIn && stake > coins && (
        <p className="text-amber-400 text-sm mt-3">Not enough points for this ante.</p>
      )}

      {phase === "active" && (
        <div className="mt-4 flex flex-col gap-2.5">
          {raisesThisStreet < 2 && (
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500 shrink-0">Raise to</span>
              <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden">
                <button type="button" disabled={loading} onClick={() => setRaiseAmount((a) => Math.max(toCall + stake, a - stake))}
                  className="w-9 h-9 flex items-center justify-center text-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors">−</button>
                <span className="w-16 text-center font-bold tabular-nums">{raiseAmount}</span>
                <button type="button" disabled={loading} onClick={() => setRaiseAmount((a) => Math.min(coins, a + stake))}
                  className="w-9 h-9 flex items-center justify-center text-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors">+</button>
              </div>
              <button type="button" disabled={loading || coins <= toCall + stake} onClick={() => setRaiseAmount(coins)}
                className="ml-auto px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors disabled:opacity-40">
                Max
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => act("fold")}
              disabled={loading}
              className="rounded-lg bg-gradient-to-b from-red-500 to-red-700 text-white font-extrabold text-sm sm:text-base tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(239,68,68,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
            >
              Fold
            </button>
            {toCall === 0 ? (
              <button
                onClick={() => act("check")}
                disabled={loading}
                className="rounded-lg bg-gradient-to-b from-sky-400 to-sky-600 text-zinc-950 font-extrabold text-sm sm:text-base tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(56,189,248,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
              >
                Check
              </button>
            ) : (
              <button
                onClick={() => act("call")}
                disabled={loading || toCall > coins}
                className="rounded-lg bg-gradient-to-b from-sky-400 to-sky-600 text-zinc-950 font-extrabold text-sm sm:text-base tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(56,189,248,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
              >
                Call {toCall}
              </button>
            )}
            <button
              onClick={() => act("raise")}
              disabled={loading || raisesThisStreet >= 2 || raiseAmount > coins}
              className="rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 font-extrabold text-sm sm:text-base tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(16,185,129,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
            >
              Raise {raiseAmount}
            </button>
            <button
              onClick={() => act("allin")}
              disabled={loading || coins <= 0}
              className="rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-sm sm:text-base tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
            >
              All in
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
