"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CardRow, CardBack } from "./GameResultView";
import { IconCoinFace } from "./icons";
import { themeFor } from "./theme";

type Phase = "setup" | "active" | "finished";

export function BlackjackInteractive({ minStake, maxStake, initialCoins }: {
  minStake: number; maxStake: number; initialCoins: number | null;
}) {
  const loggedIn = initialCoins !== null;
  const theme = themeFor("cards");
  const [coins, setCoins] = useState(initialCoins ?? 0);
  const [stake, setStake] = useState(minStake);
  const [phase, setPhase] = useState<Phase>("setup");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [handA, setHandA] = useState<string[]>([]);
  const [handB, setHandB] = useState<string[] | null>(null);
  const [activeHand, setActiveHand] = useState<0 | 1>(0);
  const [pvA, setPvA] = useState(0);
  const [pvB, setPvB] = useState<number | null>(null);
  const [dealer, setDealer] = useState<string[]>([]);
  const [dealerHidden, setDealerHidden] = useState(false); // true while the hole card is still face-down
  const [doubled, setDoubled] = useState(false);
  const [bustA, setBustA] = useState(false);
  const [bustB, setBustB] = useState(false);
  const [payout, setPayout] = useState(0);
  const [handStake, setHandStake] = useState(minStake); // total stake this hand actually settles on (double/split)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(true);

  // Resume an in-progress hand after a refresh — the stake is already locked into it.
  useEffect(() => {
    if (!loggedIn) { setResuming(false); return; }
    fetch("/api/games/blackjack/active")
      .then((r) => r.json())
      .then((body) => {
        if (body.round) {
          setRoundId(body.round.roundId);
          setStake(body.round.stake);
          setHandStake(body.round.stake * (body.round.handB ? 2 : 1));
          setHandA(body.round.player);
          setPvA(body.round.pv);
          setHandB(body.round.handB);
          setActiveHand(body.round.activeHand ?? 0);
          setDealer([body.round.dealerUpCard]);
          setDealerHidden(true);
          setDoubled(body.round.doubled);
          setPhase("active");
        }
      })
      .finally(() => setResuming(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startHand() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/blackjack/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stake, clientSeed: Math.random().toString(36).slice(2) }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Could not start hand"); return; }
    setRoundId(body.roundId);
    setHandA(body.player);
    setHandB(null);
    setActiveHand(0);
    setPvA(body.pv);
    setPvB(null);
    setDoubled(false);
    setBustA(false);
    setBustB(false);
    setHandStake(stake);
    setCoins((c) => c - stake);
    if (body.status === "finished") {
      setDealer(body.dealer);
      setDealerHidden(false);
      setPayout(body.payout);
      setCoins((c) => c + body.payout);
      setPhase("finished");
      if (body.payout > stake) fireConfetti();
    } else {
      setDealer([body.dealerUpCard]);
      setDealerHidden(true);
      setPhase("active");
    }
  }

  function applyProgress(body: { handA: string[]; handB: string[] | null; activeHand: 0 | 1 }) {
    setHandA(body.handA);
    setHandB(body.handB);
    setActiveHand(body.activeHand);
  }

  async function hit() {
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/blackjack/hit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Hit failed"); return; }
    applyProgress(body);
    if (body.movedToHandB) { setBustA(true); return; }
    if (body.finished) { finishWithDealer(body); return; }
    if (body.activeHand === 1) setPvB(blackjackValueOf(body.handB!)); else setPvA(blackjackValueOf(body.handA));
  }

  async function stand() {
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/blackjack/stand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Stand failed"); return; }
    if (body.movedToHandB) { applyProgress(body); return; }
    finishWithDealer(body);
  }

  async function double() {
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/blackjack/double", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Double failed"); return; }
    setCoins((c) => c - stake); // the matching extra stake
    setDoubled(true);
    setHandStake(stake * 2);
    setHandA(body.player);
    setPvA(body.pv);
    if (body.bust) {
      // Hole card stays face-down — a bust never needs the dealer's total.
      setBustA(true);
      setPayout(0);
      setPhase("finished");
    } else {
      finishWithDealer(body);
    }
  }

  async function split() {
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/games/blackjack/split", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Split failed"); return; }
    setCoins((c) => c - stake); // the matching extra stake
    setHandStake(stake * 2);
    if (body.finished) { finishWithDealer(body); return; }
    setHandA(body.handA);
    setHandB(body.handB);
    setActiveHand(body.activeHand);
    setPvA(blackjackValueOf(body.handA));
    setPvB(blackjackValueOf(body.handB));
  }

  function finishWithDealer(body: {
    handA: string[]; handB: string[] | null; dealer: string[]; pvA: number; pvB: number | null; payout: number;
  }) {
    setHandA(body.handA);
    setHandB(body.handB);
    setPvA(body.pvA);
    setPvB(body.pvB);
    setBustA(body.pvA > 21);
    setBustB(body.pvB !== null && body.pvB > 21);
    setDealer(body.dealer);
    setDealerHidden(false);
    setPayout(body.payout);
    setCoins((c) => c + body.payout);
    setPhase("finished");
    if (body.payout > handStake) fireConfetti();
  }

  function fireConfetti() {
    confetti({ particleCount: 90, spread: 75, startVelocity: 40, origin: { y: 0.55 }, colors: ["#10b981", "#34d399", "#f59e0b"] });
  }

  function playAgain() {
    setPhase("setup");
    setRoundId(null);
    setHandA([]);
    setHandB(null);
    setActiveHand(0);
    setDealer([]);
    setDealerHidden(false);
    setDoubled(false);
    setBustA(false);
    setBustB(false);
    setPayout(0);
  }

  const canDouble = phase === "active" && !handB && handA.length === 2 && !doubled && stake <= coins;
  const canSplit = phase === "active" && !handB && handA.length === 2
    && handA[0].slice(0, -1) === handA[1].slice(0, -1) && !doubled && stake <= coins;
  const netDelta = payout - handStake;
  const dealerFinalValue = dealerHidden ? null : blackjackValueOf(dealer);

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
                <div className="text-sm text-zinc-400 font-medium">
                  Dealer {dealerFinalValue !== null ? `(${dealerFinalValue})` : ""}
                </div>
                <div className="flex gap-2 sm:gap-3 justify-center">
                  <CardRow cards={dealer} resultKey={`${roundId}-dealer`} delays={dealerDealDelays(dealer.length)} />
                  {dealerHidden && <CardBack index={1} delay={3 * DEAL_STEP} />}
                </div>
              </div>

              <div className={`flex ${handB ? "gap-6 sm:gap-10" : ""} justify-center relative z-10`}>
                <div className={`flex flex-col items-center gap-2 ${handB && activeHand === 0 && phase === "active" ? "opacity-100" : handB ? "opacity-70" : ""}`}>
                  <CardRow cards={handA} resultKey={`${roundId}-handA-${handA.length}`} delays={playerDealDelays(handA.length)} />
                  <div className="text-sm text-zinc-400 font-medium">
                    {handB ? "Hand 1" : "You"} ({pvA}){bustA && " — bust"}
                  </div>
                </div>
                {handB && (
                  <div className={`flex flex-col items-center gap-2 ${activeHand === 1 && phase === "active" ? "opacity-100" : "opacity-70"}`}>
                    <CardRow cards={handB} resultKey={`${roundId}-handB-${handB.length}`} />
                    <div className="text-sm text-zinc-400 font-medium">
                      Hand 2 ({pvB}){bustB && " — bust"}
                    </div>
                  </div>
                )}
              </div>

              {phase === "finished" && (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  {netDelta > 0 ? (
                    <p className="text-2xl font-extrabold text-emerald-400">+{payout} points</p>
                  ) : payout > 0 ? (
                    <p className="text-2xl font-extrabold text-zinc-300">Push — {payout} points back</p>
                  ) : (
                    <p className="text-2xl font-extrabold text-red-400">Dealer wins</p>
                  )}
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
            onClick={startHand}
            disabled={loading || !loggedIn || stake > coins}
            className="rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-lg tracking-wide py-3 shadow-[0_0_25px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? "Dealing…" : "Deal"}
          </button>
          {loggedIn && stake > coins && <p className="text-amber-400 text-sm">Not enough points for this stake.</p>}
        </div>
      )}

      {phase === "active" && (
        <div className={`mt-4 grid ${canSplit ? "grid-cols-4" : "grid-cols-3"} gap-2.5`}>
          <button
            onClick={hit}
            disabled={loading}
            className="rounded-lg bg-gradient-to-b from-sky-400 to-sky-600 text-zinc-950 font-extrabold text-sm sm:text-lg tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(56,189,248,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
          >
            Hit
          </button>
          <button
            onClick={stand}
            disabled={loading}
            className="rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 font-extrabold text-sm sm:text-lg tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(16,185,129,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
          >
            Stand
          </button>
          <button
            onClick={double}
            disabled={loading || !canDouble}
            className="rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-sm sm:text-lg tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
          >
            Double
          </button>
          {canSplit && (
            <button
              onClick={split}
              disabled={loading}
              className="rounded-lg bg-gradient-to-b from-purple-400 to-purple-600 text-zinc-950 font-extrabold text-sm sm:text-lg tracking-wide py-3 shadow-[0_0_20px_-4px_rgba(168,85,247,0.8)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
            >
              Split
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}

// Real dealing rhythm: one card lands roughly every 0.4s instead of the default rapid-fire
// stagger, so the hand reads as being dealt off the deck rather than dumped on the table.
const DEAL_STEP = 0.4;

// The initial deal alternates player/dealer/player/dealer (slots 0-3), matching how a real
// dealer works the table; anything drawn afterward (a Hit, or the dealer's Stand catch-up) is a
// fresh solo card and just paces from 0 again — it never needs to line up with the opening deal.
function playerDealDelays(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i < 2 ? i * 2 * DEAL_STEP : (i - 2) * DEAL_STEP));
}
function dealerDealDelays(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? DEAL_STEP : (i - 1) * DEAL_STEP));
}

// Ace-aware total, mirroring the server's blackjackValue — only ever run on a fully revealed
// dealer hand here (after Stand/Double/bust), so there's no hidden-card ambiguity to worry about.
function blackjackValueOf(cards: string[]) {
  let total = 0, aces = 0;
  for (const c of cards) {
    const r = c.slice(0, -1);
    if (r === "A") { aces++; total += 11; }
    else if (["J", "Q", "K"].includes(r)) total += 10;
    else total += Number(r);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
