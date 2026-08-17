"use client";
import { motion } from "framer-motion";
import { IconWheelSpin } from "./games/[key]/icons";

/**
 * A living cluster of game pieces behind the headline — a spinning wheel, a flipping coin,
 * tumbling dice, a card fan — so the hero reads as "a game is happening" instead of a static
 * logo and a wall of text. Uses native emoji glyphs (Twemoji/Noto, rendered by the OS/browser
 * for free) instead of hand-drawn SVGs — better fidelity than we can draw ourselves, zero deps.
 */
export function HeroAction() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* left-side cluster */}
      <motion.div
        className="absolute left-[2%] sm:left-[6%] top-[10%] w-20 h-20 sm:w-28 sm:h-28 drop-shadow-[0_0_26px_rgba(245,158,11,0.75)]"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ scale: { duration: 0.6, ease: "backOut" }, rotate: { duration: 6, repeat: Infinity, ease: "linear" } }}
      >
        <IconWheelSpin className="w-full h-full" />
      </motion.div>

      <motion.div
        className="absolute left-[6%] sm:left-[12%] bottom-[16%] text-5xl sm:text-6xl leading-none drop-shadow-[0_0_20px_rgba(245,158,11,0.65)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 20, -15, 25, 0], y: [0, -10, 0, -6, 0] }}
        transition={{ scale: { duration: 0.6, delay: 0.2, ease: "backOut" }, rotate: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }, y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }}
      >
        🎲
      </motion.div>

      <motion.div
        className="absolute left-[1%] sm:left-[4%] bottom-[2%] text-4xl sm:text-5xl leading-none drop-shadow-[0_0_16px_rgba(245,158,11,0.75)]"
        style={{ perspective: 400 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotateY: 360 }}
        transition={{ scale: { duration: 0.6, delay: 0.4, ease: "backOut" }, rotateY: { duration: 1.8, repeat: Infinity, ease: "linear", delay: 0.6 } }}
      >
        🪙
      </motion.div>

      <motion.div
        className="absolute left-[16%] sm:left-[22%] top-[30%] text-3xl sm:text-4xl leading-none drop-shadow-[0_0_18px_rgba(16,185,129,0.8)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -8, 0], rotate: [0, -10, 10, 0] }}
        transition={{ scale: { duration: 0.6, delay: 0.5, ease: "backOut" }, y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 2.8, repeat: Infinity, ease: "easeInOut" } }}
      >
        💎
      </motion.div>

      <motion.div
        className="absolute left-[4%] sm:left-[9%] top-[42%] text-4xl sm:text-5xl leading-none drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -12, 0], rotate: [0, -6, 6, 0] }}
        transition={{ scale: { duration: 0.6, delay: 0.7, ease: "backOut" }, y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 3.6, repeat: Infinity, ease: "easeInOut" } }}
      >
        🎰
      </motion.div>

      <motion.div
        className="absolute left-[20%] sm:left-[26%] bottom-[6%] text-2xl sm:text-3xl leading-none drop-shadow-[0_0_14px_rgba(220,38,38,0.8)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -6, 0], rotate: [0, 15, -15, 0] }}
        transition={{ scale: { duration: 0.6, delay: 0.9, ease: "backOut" }, y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
      >
        🍒
      </motion.div>

      <motion.div
        className="absolute left-[10%] sm:left-[16%] top-[2%] text-2xl sm:text-3xl leading-none drop-shadow-[0_0_14px_rgba(245,245,245,0.6)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -360] }}
        transition={{ scale: { duration: 0.6, delay: 1, ease: "backOut" }, rotate: { duration: 7, repeat: Infinity, ease: "linear" } }}
      >
        ♠️
      </motion.div>

      {/* right-side cluster */}
      <motion.div
        className="absolute right-[2%] sm:right-[6%] top-[6%] text-5xl sm:text-7xl leading-none drop-shadow-[0_0_26px_rgba(245,158,11,0.75)]"
        style={{ perspective: 400 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotateY: 360 }}
        transition={{ scale: { duration: 0.6, delay: 0.1, ease: "backOut" }, rotateY: { duration: 2.4, repeat: Infinity, ease: "linear" } }}
      >
        🪙
      </motion.div>

      <motion.div
        className="absolute right-[1%] sm:right-[4%] bottom-[14%] text-5xl sm:text-6xl leading-none drop-shadow-[0_0_20px_rgba(245,158,11,0.65)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -14, 0], rotate: [0, 5, -5, 0] }}
        transition={{ scale: { duration: 0.6, delay: 0.3, ease: "backOut" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      >
        🃏
      </motion.div>

      <motion.div
        className="absolute right-[16%] sm:right-[22%] bottom-[4%] text-3xl sm:text-4xl leading-none drop-shadow-[0_0_18px_rgba(253,224,71,0.85)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 360] }}
        transition={{ scale: { duration: 0.6, delay: 0.6, ease: "backOut" }, rotate: { duration: 5, repeat: Infinity, ease: "linear" } }}
      >
        ⭐
      </motion.div>

      <motion.div
        className="absolute right-[4%] sm:right-[9%] top-[40%] text-4xl sm:text-5xl leading-none drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -12, 0], rotate: [0, 6, -6, 0] }}
        transition={{ scale: { duration: 0.6, delay: 0.75, ease: "backOut" }, y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 3.4, repeat: Infinity, ease: "easeInOut" } }}
      >
        👑
      </motion.div>

      <motion.div
        className="absolute right-[20%] sm:right-[26%] top-[4%] text-2xl sm:text-3xl leading-none drop-shadow-[0_0_14px_rgba(245,158,11,0.8)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -18, 18, 0], y: [0, -6, 0] }}
        transition={{ scale: { duration: 0.6, delay: 0.95, ease: "backOut" }, rotate: { duration: 2.6, repeat: Infinity, ease: "easeInOut" }, y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }}
      >
        🔔
      </motion.div>

      <motion.div
        className="absolute right-[10%] sm:right-[16%] bottom-[24%] text-2xl sm:text-3xl leading-none drop-shadow-[0_0_14px_rgba(16,185,129,0.7)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -8, 0] }}
        transition={{ scale: { duration: 0.6, delay: 1.1, ease: "backOut" }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
      >
        💰
      </motion.div>

      {/* drifting sparks, sides only */}
      {[4, 10, 16, 22, 78, 84, 90, 96].map((left, i) => (
        <span
          key={i}
          className="sparkle absolute bottom-0 w-1.5 h-1.5 rounded-full bg-amber-300/80"
          style={{ left: `${left}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${2.4 + (i % 3)}s` }}
        />
      ))}
    </div>
  );
}
