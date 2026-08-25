import { notFound } from "next/navigation";
import { getGame } from "@/lib/games/registry";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GamePlayer } from "./GamePlayer";
import { MinesInteractive } from "./MinesInteractive";
import { FloatingOrbs } from "../../FloatingOrbs";

export default async function GamePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const game = getGame(key);
  if (!game) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const wallet = userId ? await prisma.wallet.findUnique({ where: { userId } }) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="relative mb-4 rounded-2xl overflow-hidden border border-amber-500/20 px-5 py-5">
        <div
          className="absolute inset-0 -z-10"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 80% at 20% 0%, rgba(245,158,11,0.2) 0%, transparent 60%), linear-gradient(180deg, #1a1005 0%, #0a0a0c 100%)" }}
        />
        <FloatingOrbs />
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold">{game.name}</h1>
          <p className="text-sm text-zinc-400">{game.category} · stake {game.minStake}–{game.maxStake} points</p>
        </div>
        <p className="text-sm text-zinc-400 max-w-2xl">{game.description}</p>
      </div>
      {game.key === "mines" ? (
        <MinesInteractive
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
  );
}
