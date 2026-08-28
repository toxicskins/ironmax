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

export function IconClover({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#052e16">
        {[[19, 19], [29, 19], [19, 29], [29, 29]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="6.5" fill="#22c55e" />
        ))}
        <rect x="22.5" y="27" width="3" height="9" rx="1.5" fill="#15803d" />
      </Badge>
    </div>
  );
}

export function IconCrown({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#451a03">
        <path d="M12 32l-2-14 7 5 7-10 7 10 7-5-2 14z" fill="#fbbf24" />
        <rect x="12" y="32" width="24" height="4" rx="1" fill="#f59e0b" />
        <circle cx="12" cy="18" r="2" fill="#fde68a" /><circle cx="24" cy="13" r="2" fill="#fde68a" /><circle cx="36" cy="18" r="2" fill="#fde68a" />
      </Badge>
    </div>
  );
}

export function IconDiamondBadge({ className }: IconProps) {
  return (
    <div className={className}>
      <Badge bg="#0c4a6e">
        <path d="M17 17h14l5 6-12 13-12-13z" fill="#bae6fd" />
        <path d="M17 17h14l-7 6z" fill="#e0f2fe" />
        <path d="M17 17l-5 6 12 13z" fill="#7dd3fc" />
        <path d="M31 17l5 6-12 13z" fill="#38bdf8" />
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

const COIN_RIM_TICKS = Array.from({ length: 40 }, (_, i) => (i / 40) * Math.PI * 2);

/** Coin Flip's "heads" face — a real spread-wing eagle emblem (user-supplied artwork), engraved
 * onto the coin — instead of hand-drawn shapes. A plain HTML <img> (not a nested SVG <image>,
 * which renders unreliably when pointed at an external .svg) laid over the coin badge. */
export function IconEagle({ className, crisp }: IconProps & { crisp?: boolean }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="24" cy="24" r="22" fill="url(#eagle-grad)" />
        <circle cx="24" cy="24" r="22" stroke="#5c2e0a" strokeWidth="1.5" />
        {/* reeded edge, like a real minted coin */}
        {COIN_RIM_TICKS.map((a, i) => (
          <line
            key={i}
            x1={24 + 21.5 * Math.cos(a)} y1={24 + 21.5 * Math.sin(a)}
            x2={24 + 19.5 * Math.cos(a)} y2={24 + 19.5 * Math.sin(a)}
            stroke="rgba(92,46,10,0.35)" strokeWidth="0.6"
          />
        ))}
        <circle cx="24" cy="24" r="18.5" fill="none" stroke="rgba(92,46,10,0.4)" strokeWidth="0.75" />
        <defs>
          <linearGradient id="eagle-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
          {/* The source artwork is fine line art. At icon size (~24-96px, e.g. the idle preview
              and the heads/tails picker) those thin strokes anti-alias down to near-zero opacity
              and the eagle all but disappears, so a mild dilate bulks them back up. At the large
              flip-result size (~176-224px) the linework is already crisp and visible on its own —
              the same dilate there just melts the fine detail into a blurry blob, so `crisp`
              skips it entirely instead of tuning one radius to try to fit both. */}
          <filter id="eagle-dilate" x="-30%" y="-30%" width="160%" height="160%">
            <feMorphology operator="dilate" radius="1.4" />
          </filter>
        </defs>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/coin-eagle.svg" alt=""
        className="absolute left-[6%] top-[23%] w-[88%]"
        style={crisp ? undefined : { filter: "url(#eagle-dilate)" }}
      />
    </div>
  );
}

/** Coin Flip's "tails" face — a heraldic shield inside a full laurel wreath, like a real coin
 * reverse (reeded rim, layered leaves, engraved shading) — instead of a flat silhouette. */
export function IconLaurelStar({ className }: IconProps) {
  const leaf = (x: number, y: number, angle: number, scale = 1) => (
    <path
      d="M0,0 C-1.6,-1.2 -1.6,-3.2 0,-4.6 C1.6,-3.2 1.6,-1.2 0,0 Z"
      fill="#71717a"
      stroke="#3f3f46"
      strokeWidth="0.3"
      transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}
    />
  );
  const leftLeaves = [
    [16, 32, -100], [14.2, 27, -85], [13.2, 21.5, -65], [13.5, 16, -40], [15.5, 11.5, -15],
  ] as const;
  const rightLeaves = leftLeaves.map(([x, y, a]) => [48 - x, y, -a] as const);

  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="22" fill="url(#tails-grad)" />
      <circle cx="24" cy="24" r="22" stroke="#27272a" strokeWidth="1.5" />
      {COIN_RIM_TICKS.map((a, i) => (
        <line
          key={i}
          x1={24 + 21.5 * Math.cos(a)} y1={24 + 21.5 * Math.sin(a)}
          x2={24 + 19.5 * Math.cos(a)} y2={24 + 19.5 * Math.sin(a)}
          stroke="rgba(39,39,42,0.35)" strokeWidth="0.6"
        />
      ))}
      <circle cx="24" cy="24" r="18.5" fill="none" stroke="rgba(39,39,42,0.4)" strokeWidth="0.75" />
      <defs>
        <linearGradient id="tails-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f4f5" />
          <stop offset="1" stopColor="#8f8f97" />
        </linearGradient>
      </defs>

      {/* laurel wreath stems */}
      <path d="M17 12c-6 5-8 15-3 24" stroke="#52525b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M31 12c6 5 8 15 3 24" stroke="#52525b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {leftLeaves.map((l, i) => <g key={`l-${i}`}>{leaf(l[0], l[1], l[2])}</g>)}
      {rightLeaves.map((l, i) => <g key={`r-${i}`}>{leaf(l[0], l[1], l[2])}</g>)}

      {/* heraldic shield */}
      <path d="M24 12 L33 15.5 V25 C33 33 24 38 24 38 C24 38 15 33 15 25 V15.5 Z" fill="#d4d4d8" stroke="#3f3f46" strokeWidth="0.75" />
      <path d="M24 12 L33 15.5 V25 C33 30.5 28.5 34.7 24 37 Z" fill="#a1a1aa" opacity="0.6" />
      <path d="M17.5 17 L30.5 17" stroke="#71717a" strokeWidth="0.6" />
      {/* star centerpiece */}
      <path d="M24 18l2 5.2h5.5l-4.4 3.4 1.6 5.4-4.7-3.4-4.7 3.4 1.6-5.4-4.4-3.4H22z" fill="#3f3f46" />
    </svg>
  );
}
