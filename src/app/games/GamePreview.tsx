import Image from "next/image";
import { themeFor } from "./[key]/theme";

// Headline "up to Nx" figure shown on the poster, matching how real casino lobbies badge their games.
const MAX_MULT: Record<string, number> = {
  "slots-classic": 918, "slots-fruits": 206, limbo: 96, coinflip: 2,
  wheel: 10, roulette: 35.5, mines: 240, tower: 62914, plinko: 43.2, keno: 219,
  hilo: 2.04, blackjack: 2.54, baccarat: 9.7, "video-poker": 144,
  "sic-bo": 207, "scratch-gold": 26,
  "memory-flip": 6.72, bingo: 3.52, "tank-shot": 19.2, "golden-ticket": 30,
};
const HOT: Set<string> = new Set(["slots-fruits", "limbo", "plinko", "video-poker"]);

export function GamePreview({ gameKey, category, className }: { gameKey: string; category: string; className?: string }) {
  const maxMult = MAX_MULT[gameKey];
  const isHot = HOT.has(gameKey);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`} style={{ backgroundImage: themeFor(category).radial }}>
      <Image
        src={`/games/${gameKey}.png`}
        alt=""
        fill
        unoptimized
        className="object-cover"
      />
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 36px -4px rgba(0,0,0,0.5), inset 0 0 2px 1px rgba(255,255,255,0.08)" }} />

      {isHot && (
        <div className="badge-pop absolute top-2 left-2 z-10 rounded bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 shadow-[0_0_10px_rgba(220,38,38,0.8)]">
          HOT
        </div>
      )}
      {maxMult && (
        <div className="absolute bottom-2 right-2 z-10 rounded-full bg-black/70 backdrop-blur-sm border border-amber-400/40 text-amber-300 text-xs font-bold px-2.5 py-1">
          up to {maxMult}x
        </div>
      )}
    </div>
  );
}
