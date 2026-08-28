import Link from "next/link";
import { auth } from "@/auth";
import { GAMES } from "@/lib/games/registry";
import { GamePreview } from "./games/GamePreview";
import { themeFor } from "./games/[key]/theme";
import { Logo } from "./Logo";
import { HeroAction } from "./HeroAction";
import { FloatingOrbs } from "./FloatingOrbs";

const TICKER_ITEMS = GAMES.map((g) => g.name);

const STEPS = [
  { n: "1", icon: "🪪", title: "Sign up", body: "Create a free account in seconds — no card needed to sign up." },
  { n: "2", icon: "💳", title: "Top up", body: "100 points = €1. Add points whenever you want to play." },
  { n: "3", icon: "🎮", title: "Play & chase the win", body: `${GAMES.length} games, provably-fair outcomes, instant results.` },
];

const TRUST = [
  { icon: "🎰", title: `${GAMES.length} games`, body: "Slots, table games, wheels — one lobby." },
  { icon: "🔒", title: "Provably fair", body: "Every bet is seed-verifiable, no black box." },
  { icon: "⚡", title: "Instant results", body: "No waiting, no withdrawal delays — it's just for fun." },
  { icon: "📋", title: "Clear paytables", body: "Every game shows its exact rules and payouts up front." },
];

const HERO_STATS = [
  { value: String(GAMES.length), label: "games" },
  { value: "96%", label: "avg. RTP" },
  { value: "24/7", label: "instant play" },
];

const CATEGORY_LABEL: Record<string, string> = {
  slots: "Slots", dice: "Dice", wheel: "Wheel & Table", board: "Board", cards: "Cards",
};

function GameTile({ g }: { g: { key: string; name: string; category: string } }) {
  const theme = themeFor(g.category);
  return (
    <Link href={`/games/${g.key}`}
      className={`group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] ${theme.hoverBorder}`}>
      <GamePreview gameKey={g.key} category={g.category} className="aspect-square" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{CATEGORY_LABEL[g.category] ?? g.category}</div>
        <div className="font-extrabold text-white text-base leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">{g.name}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-sm px-5 py-2 shadow-[0_0_24px_-2px_rgba(245,158,11,0.9)]">
          ▶ PLAY
        </span>
      </div>
    </Link>
  );
}

export default async function Home() {
  const session = await auth();
  const loggedIn = !!session?.user;
  const ctaHref = loggedIn ? "/games" : "/register";
  const featured = GAMES.find((g) => g.key === "plinko") ?? GAMES[0];
  const rest = GAMES.filter((g) => g.key !== featured.key).slice(0, 7);
  const popular = [featured, ...rest];
  const newGames = GAMES.filter((g) => !popular.includes(g)).slice(0, 4);

  return (
    <div className="flex flex-col flex-1">
      {/* Jackpot ticker — a scrolling marquee strip like a real casino lobby sign */}
      <div className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-r from-zinc-950 via-amber-950/40 to-zinc-950 py-2">
        <div className="flex whitespace-nowrap ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-6 text-xs font-semibold tracking-wide text-amber-300/90">{item}</span>
          ))}
        </div>
      </div>

      {/* Hero — a big rounded promo card sitting on the page, not a full-bleed band */}
      <section className="px-4 sm:px-6 pt-6">
        <div className="relative min-h-[560px] sm:min-h-[640px] flex flex-col items-center justify-center text-center gap-2 px-6 py-16 overflow-hidden rounded-[2.5rem] border border-amber-500/25 shadow-[0_0_80px_-20px_rgba(245,158,11,0.5)]">
        <div
          className="absolute inset-0 -z-10 glow-pulse"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 70% at 50% 10%, rgba(245,158,11,0.35) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(220,38,38,0.2) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 10% 85%, rgba(16,185,129,0.16) 0%, transparent 70%), linear-gradient(180deg, #1a1005 0%, #0a0a0c 100%)" }}
        />
        <FloatingOrbs />
        <HeroAction />

        <div className="relative z-10 flex items-center gap-2 mb-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5">
          <Logo className="w-6 h-6 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          <span className="text-sm font-extrabold uppercase tracking-widest text-amber-400">IRONMAX</span>
        </div>

        <h1 className="relative z-10 text-6xl sm:text-8xl font-black tracking-tight max-w-3xl leading-[0.95]">
          Spin. Bet.{" "}
          <span className="glow-pulse bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(245,158,11,0.9)]">
            Win big.
          </span>
        </h1>
        <p className="relative z-10 max-w-xl text-zinc-300 text-lg mt-2">
          {GAMES.length} casino-style games, played with points.{" "}
          <span className="text-zinc-500">Just for fun — never for cash.</span>
        </p>
        <div className="relative z-10 flex flex-wrap justify-center gap-4 mt-6">
          <Link href={ctaHref} className="glow-pulse rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-lg px-8 py-4 shadow-[0_0_45px_-6px_rgba(245,158,11,1)] hover:brightness-110 hover:scale-105 transition-all">
            Play now
          </Link>
          <Link href="/games" className="rounded-full border-2 border-zinc-700 px-8 py-4 font-semibold hover:border-amber-500 hover:shadow-[0_0_25px_-4px_rgba(245,158,11,0.6)] hover:scale-105 transition-all">
            Browse games
          </Link>
        </div>
        <div className="relative z-10 flex gap-8 mt-8">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{s.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Popular games — one uniform grid, full-bleed edge to edge */}
      <section className="px-6 sm:px-10 py-16 w-full">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
          Popular <span className="text-amber-400">right now</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {popular.map((g) => <GameTile key={g.key} g={g} />)}
        </div>

        <div className="text-center mt-10">
          <Link href="/games" className="inline-block rounded-full border border-amber-500/40 px-6 py-2.5 text-amber-400 hover:bg-amber-500/10 transition-colors">
            See all {GAMES.length} games →
          </Link>
        </div>
      </section>

      {/* New games — a single row of 4 */}
      <section className="px-6 sm:px-10 pb-16 w-full">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
          New <span className="text-amber-400">games</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {newGames.map((g) => <GameTile key={g.key} g={g} />)}
        </div>
      </section>

      {/* How it works — felt-table green, like the underside of a card table, full-bleed */}
      <section className="relative px-6 sm:px-10 py-20 w-full border-y border-emerald-900/40 overflow-hidden"
        style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,78,59,0.5) 0%, transparent 70%), linear-gradient(180deg, #052015 0%, #030907 100%)" }}>
        <div className="absolute inset-0 -z-10 opacity-[0.06] text-8xl font-black flex flex-wrap gap-12 p-6 select-none pointer-events-none">
          {"♠♥♦♣".repeat(6).split("").map((s, i) => <span key={i}>{s}</span>)}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-12 text-left">How it works</h2>
        <div className="relative grid sm:grid-cols-3 gap-8 w-full">
          {/* connecting line between steps, desktop only */}
          <div className="hidden sm:block absolute top-9 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          {STEPS.map((s) => (
            <div key={s.n}
              className="relative text-left rounded-2xl border border-emerald-900/50 bg-black/30 backdrop-blur-sm p-6 transition-all hover:-translate-y-1 hover:border-amber-500/40">
              <div className="relative w-16 h-16 mb-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-2xl flex items-center justify-center shadow-[0_0_28px_-4px_rgba(245,158,11,0.9)]">
                <span className="text-3xl">{s.icon}</span>
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-zinc-950 border-2 border-amber-400 text-amber-400 text-xs font-extrabold flex items-center justify-center">{s.n}</span>
              </div>
              <div className="font-bold text-lg mb-1">{s.title}</div>
              <p className="text-sm text-zinc-400 max-w-xs">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges, full-bleed */}
      <section className="px-6 sm:px-10 py-20 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full">
          {TRUST.map((t) => (
            <div key={t.title}
              className="group relative rounded-xl border border-zinc-800 bg-zinc-900 p-5 overflow-hidden transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-[0_0_30px_-8px_rgba(245,158,11,0.6)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl mb-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{t.icon}</div>
              <div className="font-bold text-amber-400 mb-1">{t.title}</div>
              <p className="text-sm text-zinc-400">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA — poker-chip pattern glowing behind the spotlight */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="relative px-6 py-24 sm:py-32 text-center overflow-hidden rounded-[2.5rem] border border-amber-500/30 glow-pulse"
          style={{ boxShadow: "0 0 120px -20px rgba(245,158,11,0.65)" }}>
          <div
            className="absolute inset-0 -z-10 opacity-30"
            style={{
              backgroundImage: "repeating-conic-gradient(#f59e0b 0deg 18deg, #78350f 18deg 36deg)",
              backgroundSize: "70px 70px",
              maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 80%)",
            }}
          />
          <div
            className="absolute inset-0 -z-10"
            style={{ backgroundImage: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(245,158,11,0.35) 0%, transparent 70%), linear-gradient(180deg, #1a1005 0%, #0a0a0c 100%)" }}
          />
          <FloatingOrbs />
          <h2 className="relative z-10 text-4xl sm:text-6xl font-black tracking-tight mb-4">
            Ready to{" "}
            <span className="bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(245,158,11,0.9)]">
              play?
            </span>
          </h2>
          <p className="relative z-10 text-zinc-300 text-lg mb-8 max-w-lg mx-auto">
            {loggedIn ? "Pick a game and start playing." : "Sign up, top up points, and start playing. No card required to sign up."}
          </p>
          <Link href={ctaHref}
            className="relative z-10 inline-block rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-extrabold text-lg px-10 py-4 shadow-[0_0_50px_-6px_rgba(245,158,11,1)] hover:brightness-110 hover:scale-105 transition-all">
            {loggedIn ? "Browse games" : "Sign up free"}
          </Link>
        </div>
      </section>
    </div>
  );
}
