"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "../Logo";
import { FloatingOrbs } from "../FloatingOrbs";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Something went wrong"); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return <p className="relative text-sm text-red-400 text-center">This reset link is missing its token — request a new one.</p>;
  }

  if (done) {
    return (
      <div className="relative text-center">
        <h1 className="text-xl font-bold mb-2">Password updated</h1>
        <p className="text-sm text-zinc-400">Redirecting you to log in…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="relative text-xl font-bold text-center mb-1">Choose a new password</h1>
      <p className="relative text-sm text-zinc-400 text-center mb-6">Make it at least 8 characters.</p>
      <form onSubmit={onSubmit} className="relative flex flex-col gap-3">
        <input type="password" required minLength={8} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
        <input type="password" required minLength={8} placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading}
          className="rounded bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-semibold py-2 hover:brightness-110 disabled:opacity-50 transition">
          {loading ? "Saving…" : "Reset password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 px-6 py-8"
        style={{ backgroundImage: "radial-gradient(ellipse 80% 80% at 50% 0%, rgba(245,158,11,0.18) 0%, transparent 60%), linear-gradient(180deg, #1a1005 0%, #0a0a0c 100%)" }}>
        <FloatingOrbs />
        <div className="relative flex items-center justify-center gap-2 mb-5">
          <Logo className="w-8 h-8 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
          <span className="text-lg font-extrabold tracking-tight text-amber-400">IRONMAX</span>
        </div>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
        <Link href="/login" className="relative block text-xs text-zinc-500 text-center mt-4 hover:text-amber-400">← Back to log in</Link>
      </div>
    </div>
  );
}
