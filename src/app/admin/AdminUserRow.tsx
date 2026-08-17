"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string; email: string; coins: number; role: string;
  firstName: string; lastName: string; billingAddress: string;
};

export function AdminUserRow({ user }: { user: User }) {
  const [delta, setDelta] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function adjust() {
    if (!delta) return;
    setBusy(true);
    await fetch("/api/admin/adjust-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, coinsDelta: delta, note: "Admin panel adjustment" }),
    });
    setBusy(false);
    setDelta(0);
    router.refresh();
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email, firstName: form.firstName, lastName: form.lastName,
        billingAddress: form.billingAddress, role: form.role,
      }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="px-4 py-3 text-sm flex flex-col gap-2 bg-zinc-900/50">
        <div className="grid grid-cols-2 gap-2">
          <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email" className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm" />
          <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="First name" className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm" />
          <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            placeholder="Last name" className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm" />
          <input value={form.billingAddress} onChange={(e) => setForm((f) => ({ ...f, billingAddress: e.target.value }))}
            placeholder="Billing address" className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm" />
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving}
            className="rounded bg-amber-500 text-zinc-950 px-3 py-1 text-xs font-medium hover:bg-amber-400 disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => { setEditing(false); setForm(user); }} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-sm">
      <span className="flex-1 truncate">{user.email}{user.role === "ADMIN" && <span className="ml-2 text-amber-400 text-xs">ADMIN</span>}</span>
      <span className="text-zinc-400">points: {user.coins}</span>
      <input type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value))}
        className="w-20 rounded border border-zinc-700 bg-zinc-950 px-2 py-1" placeholder="±points" />
      <button onClick={adjust} disabled={busy || !delta}
        className="rounded bg-amber-500 text-zinc-950 px-3 py-1 text-xs font-medium hover:bg-amber-400 disabled:opacity-40">
        Apply
      </button>
      <button onClick={() => setEditing(true)} className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:border-amber-500 hover:text-amber-400">
        Edit
      </button>
    </div>
  );
}
