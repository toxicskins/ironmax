"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "../Logo";
import { FloatingOrbs } from "../FloatingOrbs";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 px-6 py-8"
        style={{ backgroundImage: "radial-gradient(ellipse 80% 80% at 50% 0%, rgba(245,158,11,0.18) 0%, transparent 60%), linear-gradient(180deg, #1a1005 0%, #0a0a0c 100%)" }}>
        <FloatingOrbs />
        <div className="relative flex items-center justify-center gap-2 mb-5">
          <Logo className="w-8 h-8 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
          <span className="text-lg font-extrabold tracking-tight text-amber-400">IRONMAX</span>
        </div>

        {sent ? (
          <div className="relative text-center">
            <h1 className="text-xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-zinc-400">
              If an account exists for <span className="text-zinc-200">{email}</span>, we&apos;ve sent a link to reset your password.
            </p>
            <Link href="/login" className="inline-block mt-6 text-sm text-amber-400 hover:underline">← Back to log in</Link>
          </div>
        ) : (
          <>
            <h1 className="relative text-xl font-bold text-center mb-1">Forgot your password?</h1>
            <p className="relative text-sm text-zinc-400 text-center mb-6">Enter your email and we&apos;ll send you a reset link.</p>
            <form onSubmit={onSubmit} className="relative flex flex-col gap-3">
              <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
              <button disabled={loading}
                className="rounded bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-semibold py-2 hover:brightness-110 disabled:opacity-50 transition">
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <Link href="/login" className="text-xs text-zinc-500 text-center hover:text-amber-400">← Back to log in</Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
