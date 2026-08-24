"use client";
import { useEffect, useState } from "react";

export type BetParams = Record<string, unknown>;

/**
 * Per-game bet controls. Dice/Limbo/Coinflip/Roulette had no way to actually choose what
 * you were betting on — the server silently used a fixed default. This exposes the real
 * choice (and the live win-chance/multiplier it implies) for every param the backend reads.
 */
export function BetControls({ gameKey, onChange }: { gameKey: string; onChange: (params: BetParams) => void }) {
  if (gameKey === "dice") return <DiceControls onChange={onChange} />;
  if (gameKey === "limbo") return <LimboControls onChange={onChange} />;
  if (gameKey === "coinflip") return <CoinflipControls onChange={onChange} />;
  if (gameKey === "roulette") return <RouletteControls onChange={onChange} />;
  if (gameKey === "mines") return <MinesControls onChange={onChange} />;
  if (gameKey === "tower") return <TowerControls onChange={onChange} />;
  if (gameKey === "keno") return <KenoControls onChange={onChange} />;
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

function DiceControls({ onChange }: { onChange: (p: BetParams) => void }) {
  const [winChancePct, setWinChancePct] = useState(50);
  const targetBp = Math.round(winChancePct * 100);
  const payout = (0.96 / (winChancePct / 100)).toFixed(2);

  function update(v: number) {
    setWinChancePct(v);
    onChange({ targetBp: Math.round(v * 100) });
  }

  // Emit the default on mount too — without this, leaving the slider untouched and pressing
  // Play sent no targetBp at all, which the server's validator rejected outright instead of
  // treating as "use the default" (see registry.ts's invalidTargetBp for the other half of the fix).
  useEffect(() => { onChange({ targetBp }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Row label="Win chance">
      <input type="range" min={1} max={95} value={winChancePct} onChange={(e) => update(Number(e.target.value))} className="flex-1 min-w-[120px]" />
      <span className="text-sm font-semibold text-amber-400 w-14">{winChancePct}%</span>
      <span className="text-xs text-zinc-500">pays {payout}x</span>
      <input type="hidden" value={targetBp} readOnly />
    </Row>
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
          className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize flex items-center gap-1.5 ${call === v ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
          <span aria-hidden>{v === "heads" ? "🪙" : "⚪"}</span>
          {v}
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
      <input type="number" min={0} max={36} placeholder="or a number"
        onChange={(e) => { const v = e.target.value; if (v !== "") pick(v); }}
        className="w-28 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm" />
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
