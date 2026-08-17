/** Per-category visual world so the stage doesn't read as one amber box repeated 16 times. */
export type StageTheme = {
  glow: string; // box-shadow color
  radial: string; // background-image value
  border: string; // tailwind border class
  accent: string; // tailwind text/bg accent class base (amber-500 equivalent)
  hoverBorder: string; // tailwind hover:border class, solid, for catalog card hover
};

export const STAGE_THEME: Record<string, StageTheme> = {
  slots: {
    glow: "rgba(236,72,153,0.4)",
    radial: "radial-gradient(ellipse 90% 60% at 50% 10%, rgba(236,72,153,0.22) 0%, transparent 60%), radial-gradient(ellipse at center, #3a1030 0%, #0a0a0c 72%)",
    border: "border-pink-500/25",
    accent: "pink-500",
    hoverBorder: "hover:border-pink-500 hover:shadow-[0_0_24px_-4px_rgba(236,72,153,0.6)]",
  },
  dice: {
    glow: "rgba(56,189,248,0.35)",
    radial: "radial-gradient(ellipse 90% 60% at 50% 10%, rgba(56,189,248,0.2) 0%, transparent 60%), radial-gradient(ellipse at center, #0c2a3a 0%, #0a0a0c 72%)",
    border: "border-sky-500/25",
    accent: "sky-500",
    hoverBorder: "hover:border-sky-500 hover:shadow-[0_0_24px_-4px_rgba(56,189,248,0.6)]",
  },
  wheel: {
    glow: "rgba(245,158,11,0.35)",
    radial: "radial-gradient(ellipse 90% 60% at 50% 10%, rgba(245,158,11,0.18) 0%, transparent 60%), radial-gradient(ellipse at center, #3a2410 0%, #0a0a0c 72%)",
    border: "border-amber-500/25",
    accent: "amber-500",
    hoverBorder: "hover:border-amber-500 hover:shadow-[0_0_24px_-4px_rgba(245,158,11,0.6)]",
  },
  board: {
    glow: "rgba(16,185,129,0.35)",
    radial: "radial-gradient(ellipse 90% 60% at 50% 10%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(ellipse at center, #0f3324 0%, #0a0a0c 72%)",
    border: "border-emerald-500/25",
    accent: "emerald-500",
    hoverBorder: "hover:border-emerald-500 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)]",
  },
  cards: {
    glow: "rgba(16,185,129,0.3)",
    radial: "radial-gradient(ellipse 90% 60% at 50% 10%, rgba(6,95,70,0.3) 0%, transparent 60%), radial-gradient(ellipse at center, #0a2e1f 0%, #0a0a0c 72%)",
    border: "border-emerald-700/40",
    accent: "emerald-600",
    hoverBorder: "hover:border-emerald-600 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.5)]",
  },
  crash: {
    glow: "rgba(239,68,68,0.4)",
    radial: "radial-gradient(ellipse 90% 60% at 50% 10%, rgba(239,68,68,0.2) 0%, transparent 60%), radial-gradient(ellipse at center, #3a1410 0%, #0a0a0c 72%)",
    border: "border-red-500/25",
    accent: "red-500",
    hoverBorder: "hover:border-red-500 hover:shadow-[0_0_24px_-4px_rgba(239,68,68,0.6)]",
  },
};

export function themeFor(category: string): StageTheme {
  return STAGE_THEME[category] ?? STAGE_THEME.wheel;
}
