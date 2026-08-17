"use client";
import { motion } from "framer-motion";

type Orb = { size: number; left: string; top: string; color: string; duration: number; delay: number };

const ORBS: Orb[] = [
  { size: 170, left: "2%", top: "4%", color: "rgba(245,158,11,0.55)", duration: 7, delay: 0 },
  { size: 100, left: "86%", top: "2%", color: "rgba(220,38,38,0.5)", duration: 6, delay: 0.4 },
  { size: 70, left: "76%", top: "62%", color: "rgba(16,185,129,0.45)", duration: 5.5, delay: 0.8 },
  { size: 120, left: "8%", top: "68%", color: "rgba(245,158,11,0.45)", duration: 8, delay: 0.2 },
  { size: 55, left: "46%", top: "-4%", color: "rgba(253,224,71,0.55)", duration: 4.8, delay: 1.1 },
  { size: 85, left: "94%", top: "40%", color: "rgba(245,158,11,0.5)", duration: 6.5, delay: 0.6 },
];

/** Soft floating glow orbs for a bubbly, alive backdrop behind a section header —
 * a lightweight nod to lobby-style casino sites without touching the amber/black palette. */
export function FloatingOrbs({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}>
      {ORBS.map((o, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full blur-md"
          style={{ width: o.size, height: o.size, left: o.left, top: o.top, backgroundColor: o.color }}
          animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
          transition={{ duration: o.duration, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
        />
      ))}
    </div>
  );
}
