import { notFound } from "next/navigation";
import { getGame } from "@/lib/games/registry";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GamePlayer } from "./GamePlayer";
import { MinesInteractive } from "./MinesInteractive";
import { BlackjackInteractive } from "./BlackjackInteractive";
import { TowerInteractive } from "./TowerInteractive";
import { HiLoInteractive } from "./HiLoInteractive";
import { BaccaratInteractive } from "./BaccaratInteractive";
import { HoldemInteractive } from "./HoldemInteractive";
import { FloatingOrbs } from "../../FloatingOrbs";

export default async function GamePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const game = getGame(key);
  if (!game) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const wallet = userId ? await prisma.wallet.findUnique({ where: { userId } }) : null;

  return (
    <div className="relative">
      {/* Ambient backdrop for the whole page, not just the header banner — floating glow orbs
          and a faint dot texture so the space around the game frame doesn't read as dead space
          on wide screens. Absolutely positioned within this wrapper (not `fixed` to the viewport)
          so it can never paint over the site header/footer, which live outside this wrapper. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 50% at 15% 10%, rgba(245,158,11,0.1) 0%, transparent 55%), radial-gradient(ellipse 60% 45% at 100% 90%, rgba(220,38,38,0.08) 0%, transparent 55%), linear-gradient(180deg, #0d0a07 0%, #0a0a0c 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "34px 34px" }}
        />
        <div className="opacity-40">
          <FloatingOrbs />
        </div>
        {/* Dark vignette punched through the ambient layer, centered on the content column — keeps
            the orbs' glow confined to the margins instead of washing out text/buttons on top of them. */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 55% 100% at 50% 0%, rgba(10,10,12,0.9) 0%, rgba(10,10,12,0.75) 45%, transparent 75%)" }}
        />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="relative mb-4 rounded-2xl overflow-hidden border border-amber-500/20 px-5 py-5">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 80% at 20% 0%, rgba(245,158,11,0.2) 0%, transparent 60%), linear-gradient(180deg, #1a1005 0%, #0a0a0c 100%)" }}
        />
        <FloatingOrbs />
        {/* Darkens specifically where the title/description sit, regardless of where the orbs
            happen to be floating that frame — guarantees text contrast instead of hoping the
            colorful decoration stays out of the way. */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.55) 100%)" }} />
        {/* `relative` puts this text in the same paint layer as the absolute decoration above it —
            without it, browsers paint unpositioned flow content BEFORE positioned siblings
            regardless of DOM order, so the title/description would render behind the background. */}
        <div className="relative flex items-baseline justify-between mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold">{game.name}</h1>
          <p className="text-sm text-zinc-400">{game.category} · stake {game.minStake}–{game.maxStake} points</p>
        </div>
        <p className="relative text-sm text-zinc-400 max-w-2xl">{game.description}</p>
      </div>
      {game.key === "mines" ? (
        <MinesInteractive
          minStake={game.minStake}
          maxStake={game.maxStake}
          initialCoins={wallet?.coins ?? null}
        />
      ) : game.key === "blackjack" ? (
        <BlackjackInteractive
          minStake={game.minStake}
          maxStake={game.maxStake}
          initialCoins={wallet?.coins ?? null}
        />
      ) : game.key === "tower" ? (
        <TowerInteractive
          minStake={game.minStake}
          maxStake={game.maxStake}
          initialCoins={wallet?.coins ?? null}
        />
      ) : game.key === "hilo" ? (
        <HiLoInteractive
          minStake={game.minStake}
          maxStake={game.maxStake}
          initialCoins={wallet?.coins ?? null}
        />
      ) : game.key === "baccarat" ? (
        <BaccaratInteractive
          minStake={game.minStake}
          maxStake={game.maxStake}
          initialCoins={wallet?.coins ?? null}
        />
      ) : game.key === "video-poker" ? (
        <HoldemInteractive
          minStake={game.minStake}
          maxStake={game.maxStake}
          initialCoins={wallet?.coins ?? null}
        />
      ) : (
        <GamePlayer
          gameKey={game.key}
          category={game.category}
          minStake={game.minStake}
          maxStake={game.maxStake}
          initialCoins={wallet?.coins ?? null}
        />
      )}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 max-w-2xl">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide mb-2">How this game pays</h2>
        <ul className="flex flex-col gap-1.5 text-sm text-zinc-300 list-disc pl-5">
          {game.rules.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>
      </div>
    </div>
  );
}
