"use client";

/**
 * Authored icon set for slot symbols and game tokens — one consistent style
 * (rounded badge, soft bevel, single accent stroke) instead of emoji, which
 * render inconsistently across platforms and read as placeholder content.
 */
type IconProps = { className?: string };

function Badge({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <circle cx="24" cy="24" r="22" fill={bg} />
      <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <circle cx="24" cy="16" r="14" fill="rgba(255,255,255,0.08)" />
      {children}
    </svg>
  );
}

export function IconSeven({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#7f1d1d">
        <text x="24" y="32" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fbbf24" fontFamily="Georgia, serif">7</text>
      </Badge>
    </div>
  );
}

export function IconBar({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#1e1b4b">
        <rect x="10" y="15" width="28" height="6" rx="2" fill="#fbbf24" />
        <rect x="10" y="24" width="28" height="6" rx="2" fill="#fbbf24" />
      </Badge>
    </div>
  );
}

export function IconBell({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#78350f">
        <path d="M24 12c-5 0-8 4-8 9v4l-2 4h20l-2-4v-4c0-5-3-9-8-9z" fill="#fde047" />
        <rect x="21" y="30" width="6" height="4" rx="2" fill="#fde047" />
        <circle cx="24" cy="10" r="2" fill="#fde047" />
      </Badge>
    </div>
  );
}

export function IconCherry({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#052e16">
        <path d="M25 14c1-4 4-6 7-6" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="19" cy="30" r="7" fill="#dc2626" />
        <circle cx="31" cy="27" r="6" fill="#ef4444" />
      </Badge>
    </div>
  );
}

export function IconLemon({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#422006">
        <ellipse cx="24" cy="25" rx="12" ry="9" fill="#facc15" transform="rotate(-20 24 25)" />
        <path d="M15 16c2-2 5-2 6 0" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
      </Badge>
    </div>
  );
}

export function IconGrape({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#3b0764">
        {[[19,17],[29,17],[24,22],[16,24],[24,29],[32,24],[19,31],[29,31]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="4.2" fill="#a855f7" />
        ))}
      </Badge>
    </div>
  );
}

export function IconWatermelon({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#052e16">
        <path d="M12 22a12 12 0 0 0 24 0z" fill="#16a34a" />
        <path d="M14 22a10 10 0 0 0 20 0z" fill="#f9fafb" />
        <path d="M16.5 22a7.5 7.5 0 0 0 15 0z" fill="#dc2626" />
        <circle cx="21" cy="20" r="0.8" fill="#111" /><circle cx="24" cy="21" r="0.8" fill="#111" /><circle cx="27" cy="20" r="0.8" fill="#111" />
      </Badge>
    </div>
  );
}

export function IconOrange({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#431407">
        <circle cx="24" cy="25" r="11" fill="#fb923c" />
        <path d="M24 14v3" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
      </Badge>
    </div>
  );
}

export function IconPlum({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#4a044e">
        <circle cx="21" cy="26" r="8" fill="#a21caf" />
        <circle cx="29" cy="24" r="6" fill="#c026d3" />
        <path d="M25 14c1-3 3-4 5-4" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
      </Badge>
    </div>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#451a03">
        <path
          d="M24 11l4.2 8.6 9.5 1.4-6.9 6.7 1.6 9.4L24 32.6l-8.4 4.5 1.6-9.4-6.9-6.7 9.5-1.4z"
          fill="#fde047"
        />
      </Badge>
    </div>
  );
}

export function IconDice({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <rect x="8" y="8" width="32" height="32" rx="8" fill="#e4e4e7" />
      <rect x="8" y="8" width="32" height="32" rx="8" stroke="#a1a1aa" strokeWidth="1.5" />
      <circle cx="17" cy="17" r="2.6" fill="#18181b" />
      <circle cx="31" cy="17" r="2.6" fill="#18181b" />
      <circle cx="24" cy="24" r="2.6" fill="#18181b" />
      <circle cx="17" cy="31" r="2.6" fill="#18181b" />
      <circle cx="31" cy="31" r="2.6" fill="#18181b" />
    </svg>
  );
}

export function IconGem({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <path d="M12 18l12-9 12 9-12 20z" fill="#10b981" />
      <path d="M12 18h24l-12 20z" fill="#34d399" />
      <path d="M12 18l6-9h12l6 9" fill="#6ee7b7" />
    </svg>
  );
}

export function IconMine({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="27" r="13" fill="#18181b" />
      <circle cx="24" cy="27" r="13" stroke="#3f3f46" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1="24" y1="27"
          x2={Number((24 + 17 * Math.cos((deg * Math.PI) / 180)).toFixed(2))}
          y2={Number((27 + 17 * Math.sin((deg * Math.PI) / 180)).toFixed(2))}
          stroke="#18181b" strokeWidth="2.5" strokeLinecap="round"
        />
      ))}
      <circle cx="20" cy="23" r="2.5" fill="#71717a" />
      <path d="M24 12l3 4h-6z" fill="#f59e0b" />
    </svg>
  );
}

export function IconWheelSpin({ className }: IconProps) {
  const colors = ["#f59e0b", "#3f3f46", "#dc2626", "#3f3f46", "#f59e0b", "#3f3f46"];
  const step = 360 / colors.length;
  const gradient = colors.map((c, i) => `${c} ${i * step}deg ${(i + 1) * step}deg`).join(", ");
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <foreignObject x="2" y="2" width="44" height="44">
        <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundImage: `conic-gradient(${gradient})`, border: "2px solid #3f3f46" }} />
      </foreignObject>
      <circle cx="24" cy="24" r="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
    </svg>
  );
}

export function IconRoulettePocket({ className }: IconProps) {
  const colors = ["#dc2626", "#18181b", "#dc2626", "#18181b", "#059669", "#18181b", "#dc2626", "#18181b"];
  const step = 360 / colors.length;
  const gradient = colors.map((c, i) => `${c} ${i * step}deg ${(i + 1) * step}deg`).join(", ");
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <foreignObject x="2" y="2" width="44" height="44">
        <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundImage: `conic-gradient(${gradient})`, border: "2px solid #52525b" }} />
      </foreignObject>
    </svg>
  );
}

export function IconCardsFan({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <g transform="rotate(-16 24 26)"><rect x="14" y="10" width="18" height="26" rx="3" fill="#f4f4f5" stroke="#a1a1aa" /><text x="17" y="22" fontSize="9" fontWeight="800" fill="#dc2626">K</text></g>
      <g transform="rotate(0 24 26)"><rect x="15" y="9" width="18" height="26" rx="3" fill="#fafafa" stroke="#a1a1aa" /><text x="18" y="21" fontSize="9" fontWeight="800" fill="#18181b">A</text></g>
      <g transform="rotate(16 24 26)"><rect x="16" y="10" width="18" height="26" rx="3" fill="#f4f4f5" stroke="#a1a1aa" /><text x="19" y="22" fontSize="9" fontWeight="800" fill="#dc2626">Q</text></g>
    </svg>
  );
}

export function IconTowerStack({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="10" y={36 - i * 8} width="28" height="6" rx="2" fill={i < 2 ? "#f59e0b" : "#3f3f46"} />
      ))}
    </svg>
  );
}

export function IconPlinkoPreview({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {[0, 1, 2].map((row) =>
        Array.from({ length: 4 + row }, (_, c) => (
          <circle key={`${row}-${c}`} cx={10 + c * 7 - row * 3.5} cy={10 + row * 8} r="1.6" fill="#71717a" />
        ))
      )}
      <circle cx="24" cy="38" r="3.5" fill="#f59e0b" />
    </svg>
  );
}

export function IconKenoGrid({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}-${c}`} x={9 + c * 11} y={9 + r * 11} width="8" height="8" rx="2"
            fill={(r + c) % 3 === 0 ? "#f59e0b" : "#27272a"} />
        ))
      )}
    </svg>
  );
}

export function IconCrashChart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <path d="M6 38 Q 24 38, 40 10" stroke="#f87171" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M34 10h6v6" stroke="#f87171" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCoinFace({ className, label }: IconProps & { label: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="22" fill="url(#coin-grad)" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeDasharray="2 2" />
      <defs>
        <linearGradient id="coin-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <text x="24" y="29" textAnchor="middle" fontSize="11" fontWeight="800" fill="#78350f">{label}</text>
    </svg>
  );
}

/** Coin Flip's "heads" face — a spread-winged eagle, like a real coin obverse — instead of the
 * literal word HEADS. */
export function IconEagle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="22" fill="url(#eagle-grad)" />
      <circle cx="24" cy="24" r="22" stroke="#78350f" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(120,53,15,0.35)" strokeWidth="1" strokeDasharray="2 2" />
      <defs>
        <linearGradient id="eagle-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* wings */}
      <path d="M23 20c-8-9-16-6-19-1 7 0 13 2 19 7z" fill="#78350f" />
      <path d="M25 20c8-9 16-6 19-1-7 0-13 2-19 7z" fill="#78350f" />
      {/* head + beak */}
      <circle cx="24" cy="15" r="4" fill="#78350f" />
      <path d="M24 14l5 1.4-5 2z" fill="#78350f" />
      {/* body/tail */}
      <path d="M19 25h10l-2 12h-6z" fill="#78350f" />
    </svg>
  );
}

/** Coin Flip's "tails" face — a laurel-wreathed star, like a real coin reverse. */
export function IconLaurelStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="22" fill="url(#tails-grad)" />
      <circle cx="24" cy="24" r="22" stroke="#3f3f46" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(63,63,70,0.4)" strokeWidth="1" strokeDasharray="2 2" />
      <defs>
        <linearGradient id="tails-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4e4e7" />
          <stop offset="1" stopColor="#a1a1aa" />
        </linearGradient>
      </defs>
      {/* laurel branches */}
      <path d="M15 14c-5 5-6 14-2 21" stroke="#52525b" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M33 14c5 5 6 14 2 21" stroke="#52525b" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={`l-${i}`} cx={15 - i * 0.8} cy={19 + i * 4.5} rx="3" ry="1.6" fill="#52525b" transform={`rotate(${-40 + i * 10} ${15 - i * 0.8} ${19 + i * 4.5})`} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={`r-${i}`} cx={33 + i * 0.8} cy={19 + i * 4.5} rx="3" ry="1.6" fill="#52525b" transform={`rotate(${40 - i * 10} ${33 + i * 0.8} ${19 + i * 4.5})`} />
      ))}
      {/* star */}
      <path d="M24 15l2.5 6.5H33l-5.3 4 2 6.5-5.7-4-5.7 4 2-6.5-5.3-4h6.5z" fill="#52525b" />
    </svg>
  );
}
