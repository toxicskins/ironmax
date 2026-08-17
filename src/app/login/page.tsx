"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "../Logo";
import { FloatingOrbs } from "../FloatingOrbs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { setLoading(false); setError("Invalid email or password"); return; }
    // A full navigation instead of router.push() — server components like the header nav
    // read the session at request time, and client-side routing can race with or reuse a
    // cached RSC payload from before the session cookie was set, leaving a stale logged-out
    // header. A hard navigation guarantees every server component sees the new session.
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
        <h1 className="relative text-xl font-bold text-center mb-1">Welcome back</h1>
        <p className="relative text-sm text-zinc-400 text-center mb-6">Log in to keep playing.</p>
        <form onSubmit={onSubmit} className="relative flex flex-col gap-3">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <div className="flex flex-col gap-1.5">
            <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
            <Link href="/forgot-password" className="self-end text-xs text-zinc-500 hover:text-amber-400">Forgot password?</Link>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button disabled={loading}
            className="rounded bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-semibold py-2 hover:brightness-110 disabled:opacity-50 transition">
            {loading ? "Logging in…" : "Log in"}
          </button>
          <p className="text-xs text-zinc-500 text-center">
            No account? <Link href="/register" className="text-amber-400 hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
