"use client";
import { useEffect, useState } from "react";
import { IconEagle, IconLaurelStar } from "./icons";

export type BetParams = Record<string, unknown>;

/**
 * Per-game bet controls. Dice/Limbo/Coinflip/Roulette had no way to actually choose what
 * you were betting on — the server silently used a fixed default. This exposes the real
 * choice (and the live win-chance/multiplier it implies) for every param the backend reads.
 */
export function BetControls({ gameKey, onChange }: { gameKey: string; onChange: (params: BetParams) => void }) {
  if (gameKey === "limbo") return <LimboControls onChange={onChange} />;
  if (gameKey === "coinflip") return <CoinflipControls onChange={onChange} />;
  if (gameKey === "roulette") return <RouletteControls onChange={onChange} />;
  if (gameKey === "mines") return <MinesControls onChange={onChange} />;
  if (gameKey === "tower") return <TowerControls onChange={onChange} />;
  if (gameKey === "keno") return <KenoControls onChange={onChange} />;
  if (gameKey === "sic-bo") return <SicBoControls onChange={onChange} />;
  if (gameKey === "hilo") return <HiLoControls onChange={onChange} />;
  if (gameKey === "tank-shot") return <TankShotControls onChange={onChange} />;
  return null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-zinc-500 w-24 shrink-0">{label}</span>
      {children}
    </div>
  );
}

function LimboControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [target, setTarget] = useState(2);
  // Raw text mirrors the input so the field can sit empty mid-edit — clamping on every
  // keystroke used to snap an emptied field straight to 1.01, making it impossible to clear
  // the box and type a bigger number.
  const [text, setText] = useState("2");
  const winChancePct = Math.min(95, (0.96 / target) * 100);

  function commit(v: number) {
    const clamped = Math.min(96, Math.max(1.01, v));
    setTarget(clamped);
    onChange({ targetBp: Math.round((0.96 / clamped) * 10000) });
  }

  useEffect(() => { onChange({ targetBp: Math.round((0.96 / target) * 10000) }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Row label="Target">
      <input type="number" min={1.01} max={96} step={0.01} value={text}
        onChange={(e) => {
          setText(e.target.value);
          const v = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(v)) commit(v);
        }}
        onBlur={() => setText(String(target))}
        className="w-24 rounded border border-zinc-700 bg-zinc-950 px-2 py-1" />
      <span className="text-sm text-zinc-400">x</span>
      <span className="text-xs text-zinc-500">{winChancePct.toFixed(2)}% chance to win {target}x</span>
    </Row>
  );
}

function CoinflipControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [call, setCall] = useState<"heads" | "tails">("heads");
  function pick(v: "heads" | "tails") { setCall(v); onChange({ call: v }); }
  useEffect(() => { onChange({ call }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Row label="Call it">
      {(["heads", "tails"] as const).map((v) => (
        <button key={v} onClick={() => pick(v)}
          className={`px-3 py-1 rounded-md text-sm font-semibold capitalize flex items-center gap-1.5 ${call === v ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
          {v === "heads" ? <IconEagle className="w-5 h-5" /> : <IconLaurelStar className="w-5 h-5" />}
          {v}
        </button>
      ))}
    </Row>
  );
}

function HiLoControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [guess, setGuess] = useState<"higher" | "lower">("higher");
  function pick(v: "higher" | "lower") { setGuess(v); onChange({ guess: v }); }
  useEffect(() => { onChange({ guess }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Row label="Next card is">
      {(["higher", "lower"] as const).map((v) => (
        <button key={v} onClick={() => pick(v)}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold capitalize ${guess === v ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
          {v} (2.04x)
        </button>
      ))}
    </Row>
  );
}

function RouletteControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [bet, setBet] = useState("red");
  function pick(v: string) { setBet(v); onChange({ bet: v }); }
  useEffect(() => { onChange({ bet }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Row label="Bet on">
      {[["red", "Red (1.97x)"], ["black", "Black (1.97x)"], ["green", "Green 0 (35.5x)"]].map(([v, l]) => (
        <button key={v} onClick={() => pick(v)}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold ${bet === v ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
          {l}
        </button>
      ))}
    </Row>
  );
}

function MinesControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [mineCount, setMineCount] = useState(5);
  const [picks, setPicks] = useState(1);
  function update(m: number, p: number) {
    setMineCount(m); setPicks(p);
    onChange({ mineCount: m, picks: p });
  }
  useEffect(() => { onChange({ mineCount, picks }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const safeOdds = 1 - mineCount / 25;
  const payout = (Math.pow(1 / safeOdds, picks) * 0.96).toFixed(2);
  return (
    <div className="flex flex-col gap-2">
      <Row label="Mines">
        <input type="range" min={1} max={24} value={mineCount} onChange={(e) => update(Number(e.target.value), Math.min(picks, 25 - Number(e.target.value)))} className="flex-1 min-w-[120px]" />
        <span className="text-sm font-semibold text-amber-400 w-8">{mineCount}</span>
      </Row>
      <Row label="Tiles to pick">
        <input type="range" min={1} max={25 - mineCount} value={picks} onChange={(e) => update(mineCount, Number(e.target.value))} className="flex-1 min-w-[120px]" />
        <span className="text-sm font-semibold text-amber-400 w-8">{picks}</span>
        <span className="text-xs text-zinc-500">pays {payout}x if all safe</span>
      </Row>
    </div>
  );
}

function TowerControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [floors, setFloors] = useState(8);
  function update(v: number) { setFloors(v); onChange({ floors: v }); }
  useEffect(() => { onChange({ floors }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const payout = (0.96 / Math.pow(0.75, floors)).toFixed(2);
  return (
    <Row label="Floors">
      <input type="range" min={1} max={15} value={floors} onChange={(e) => update(Number(e.target.value))} className="flex-1 min-w-[120px]" />
      <span className="text-sm font-semibold text-amber-400 w-8">{floors}</span>
      <span className="text-xs text-zinc-500">pays {payout}x if you clear every floor</span>
    </Row>
  );
}

const SIC_BO_BET_LABELS: Record<string, string> = {
  small: "Small (4-10) — 2x", big: "Big (11-17) — 2x",
  odd: "Odd — 2x", even: "Even — 2x",
  "any-triple": "Any triple — 34.5x", triple: "Specific triple — 207x",
};

function SicBoControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [bet, setBet] = useState("small");
  const [number, setNumber] = useState(1);
  function pick(v: string) { setBet(v); onChange(v === "triple" ? { bet: v, number } : { bet: v }); }
  function pickNumber(n: number) { setNumber(n); onChange({ bet: "triple", number: n }); }
  useEffect(() => { onChange({ bet }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-col gap-2">
      <Row label="Bet on">
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(SIC_BO_BET_LABELS).map((v) => (
            <button key={v} onClick={() => pick(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold ${bet === v ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
              {SIC_BO_BET_LABELS[v]}
            </button>
          ))}
        </div>
      </Row>
      {bet === "triple" && (
        <Row label="Triple of">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n} onClick={() => pickNumber(n)}
              className={`w-8 h-8 rounded text-sm font-semibold ${number === n ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              {n}
            </button>
          ))}
        </Row>
      )}
    </div>
  );
}

function KenoControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [picks, setPicks] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  function toggle(n: number) {
    let next: number[];
    if (picks.includes(n)) next = picks.filter((p) => p !== n);
    else if (picks.length < 6) next = [...picks, n];
    else return;
    setPicks(next);
    onChange({ picks: next });
  }
  useEffect(() => { onChange({ picks }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <div className="text-xs text-zinc-500 mb-1.5">Pick 6 numbers ({picks.length}/6)</div>
      <div className="grid grid-cols-8 gap-1 max-w-md">
        {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => toggle(n)}
            className={`w-8 h-8 rounded text-xs font-semibold ${picks.includes(n) ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function TankShotControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [target, setTarget] = useState(0);
  function pick(t: number) { setTarget(t); onChange({ target: t }); }
  useEffect(() => { onChange({ target }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const mults = [2.4, 3.2, 6.4, 9.6, 19.2];
  return (
    <Row label="Aim at">
      {mults.map((m, i) => (
        <button key={i} onClick={() => pick(i)}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold ${target === i ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
          Marker {i + 1} ({m}x)
        </button>
      ))}
    </Row>
  );
}
