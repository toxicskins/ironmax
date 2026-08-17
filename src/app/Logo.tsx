export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#logo-grad)" />
      <circle cx="24" cy="24" r="22" stroke="#78350f" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="#78350f" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M15 30 L21 16 L24 24 L27 16 L33 30" stroke="#78350f" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
