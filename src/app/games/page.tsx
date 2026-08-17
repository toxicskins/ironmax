import { GAMES } from "@/lib/games/registry";
import { GameGrid } from "./GameGrid";
import { FloatingOrbs } from "../FloatingOrbs";

export default function GamesPage() {
  const games = GAMES.map(({ key, name, category, minStake, maxStake }) => ({ key, name, category, minStake, maxStake }));

  return (
    <div className="w-full px-6 sm:px-10 py-10">
      <div className="relative mb-8 rounded-2xl overflow-hidden border border-amber-500/20 px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="absolute inset-0 -z-10"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 80% at 20% 0%, rgba(245,158,11,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 100% 100%, rgba(220,38,38,0.15) 0%, transparent 60%), linear-gradient(180deg, #1a1005 0%, #0a0a0c 100%)" }}
        />
        <FloatingOrbs />
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
          {GAMES.length} games. <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]">One lobby.</span>
        </h1>
        <p className="text-zinc-400 mt-2 max-w-xl">Slots, table games, and crash — filter by category or search below.</p>
      </div>
      <GameGrid games={games} />
    </div>
  );
}
