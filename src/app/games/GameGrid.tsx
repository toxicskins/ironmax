"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { GamePreview } from "./GamePreview";
import { themeFor } from "./[key]/theme";

const CATEGORY_LABEL: Record<string, string> = {
  slots: "Slots", dice: "Dice", wheel: "Wheel & Table", board: "Board", cards: "Cards", crash: "Crash",
};

type GameSummary = { key: string; name: string; category: string; minStake: number; maxStake: number };

export function GameGrid({ games }: { games: GameSummary[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");
  const categories = useMemo(() => ["all", ...Array.from(new Set(games.map((g) => g.category)))], [games]);

  const filtered = games.filter((g) => {
    if (active !== "all" && g.category !== active) return false;
    if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const isActive = active === c;
            const theme = c === "all" ? null : themeFor(c);
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  isActive
                    ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_20px_-4px_rgba(245,158,11,0.9)]"
                    : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                }`}
                style={!isActive && theme ? { boxShadow: `inset 0 0 0 1px ${theme.glow}` } : undefined}
              >
                {c === "all" ? "All games" : CATEGORY_LABEL[c] ?? c}
              </button>
            );
          })}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games…"
          className="ml-auto w-full sm:w-56 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm placeholder:text-zinc-500 focus:border-amber-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {filtered.map((g) => {
          const theme = themeFor(g.category);
          return (
            <Link key={g.key} href={`/games/${g.key}`}
              className={`group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] ${theme.hoverBorder}`}
            >
              <GamePreview gameKey={g.key} category={g.category} className="aspect-square" />

              {/* glossy scrim + overlaid title, like a real lobby tile */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{CATEGORY_LABEL[g.category] ?? g.category}</div>
                <div className="font-extrabold text-white text-base leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">{g.name}</div>
              </div>

              {/* hover-only PLAY pill for a punchy call to action */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-sm px-5 py-2 shadow-[0_0_24px_-2px_rgba(245,158,11,0.9)]">
                  ▶ PLAY
                </span>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-zinc-500 py-16">No games match “{query}”.</p>
        )}
      </div>
    </div>
  );
}
