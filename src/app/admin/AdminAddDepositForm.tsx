"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminAddDepositForm({ users }: { users: { id: string; email: string }[] }) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [eurAmount, setEurAmount] = useState(10);
  const [status, setStatus] = useState<"PENDING" | "COMPLETED" | "FAILED">("PENDING");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, eurAmount, status }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to add deposit");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="rounded bg-amber-500 text-zinc-950 px-3 py-1.5 text-xs font-medium hover:bg-amber-400">
        + Add deposit
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-zinc-800 p-4 max-w-lg flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <select value={userId} onChange={(e) => setUserId(e.target.value)}
          className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100">
          {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
        <input type="number" min={1} step="0.01" required value={eurAmount} onChange={(e) => setEurAmount(Number(e.target.value))}
          placeholder="Amount (€)" className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100">
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>
      <p className="text-xs text-zinc-500">→ {Math.round(eurAmount * 100)} points. Completed credits the wallet and emails the invoice immediately.</p>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={busy || !userId}
          className="rounded bg-amber-500 text-zinc-950 px-4 py-1.5 text-sm font-medium hover:bg-amber-400 disabled:opacity-50">
          {busy ? "Adding…" : "Add deposit"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
      </div>
    </form>
  );
}
