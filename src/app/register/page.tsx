"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "../Logo";
import { FloatingOrbs } from "../FloatingOrbs";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setLoading(false);
      setError(body.error ?? "Registration failed");
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    // Full navigation — see the comment in login/page.tsx for why router.push() left the
    // header stale after sign-in.
    window.location.href = "/account";
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
        <h1 className="relative text-xl font-bold text-center mb-1">Create account</h1>
        <p className="relative text-sm text-zinc-400 text-center mb-6">Top up points and start playing in seconds.</p>
        <form onSubmit={onSubmit} className="relative flex flex-col gap-3">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <input type="password" required minLength={8} placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <label className="flex items-start gap-2.5 text-xs text-zinc-500 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0" />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-amber-400 hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-amber-400 hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button disabled={loading || !agreed}
            className="rounded bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-semibold py-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition">
            {loading ? "Creating account…" : "Sign up"}
          </button>
          <p className="text-xs text-zinc-500 text-center">
            Already have an account? <Link href="/login" className="text-amber-400 hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
