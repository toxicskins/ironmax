/**
 * Card-scheme and 3-D Secure marks shown in the footer and at checkout. Drawn inline so they need
 * no external assets; swap for the official artwork from the acquirer if it is supplied.
 */
function Badge({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <>
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex h-8 items-center justify-center rounded-md bg-white px-2 shadow-sm"
    >
      {children}
    </span>
    {/* not rendered in the flex row; keeps badge names apart for text readers */}
    {" "}
    </>
  );
}

function McCircles({ size = 20 }: { size?: number }) {
  const r = size / 2;
  return (
    <svg width={size * 1.6} height={size} viewBox={`0 0 ${size * 1.6} ${size}`} aria-hidden>
      <circle cx={r} cy={r} r={r} fill="#EB001B" />
      <circle cx={size * 1.6 - r} cy={r} r={r} fill="#F79E1B" />
      <path
        d={`M${size * 0.8} ${size * 0.1} a${r} ${r} 0 0 1 0 ${size * 0.8} a${r} ${r} 0 0 1 0 -${size * 0.8}z`}
        fill="#FF5F00"
      />
    </svg>
  );
}

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Badge label="Visa">
        <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden>
          <text x="22" y="14" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900" fontStyle="italic" fontSize="16" fill="#1A1F71">VISA</text>
        </svg>
      </Badge>
      <Badge label="Mastercard">
        <McCircles />
      </Badge>
      <Badge label="Visa Secure (3-D Secure)">
        <svg width="62" height="22" viewBox="0 0 62 22" aria-hidden>
          <rect x="0" y="0" width="62" height="22" rx="3" fill="#1A1F71" />
          <text x="5" y="15" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900"
            fontStyle="italic" fontSize="11" fill="#fff">VISA</text>
          <text x="33" y="15" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700"
            fontSize="9" fill="#F7B600">Secure</text>
        </svg>
      </Badge>
      <Badge label="Mastercard ID Check (3-D Secure)">
        <span className="flex items-center gap-1">
          <McCircles size={14} />
          <span className="text-[10px] font-bold leading-none text-zinc-900">ID Check</span>
        </span>
      </Badge>
    </div>
  );
}
