"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminAddUserForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create user");
      return;
    }
    setEmail(""); setPassword(""); setFirstName(""); setLastName(""); setRole("USER");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="rounded bg-amber-500 text-zinc-950 px-3 py-1.5 text-xs font-medium hover:bg-amber-400">
        + Add user
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-zinc-800 p-4 max-w-lg flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input type="password" required minLength={8} placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
          className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <select value={role} onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
          className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100">
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={busy}
          className="rounded bg-amber-500 text-zinc-950 px-4 py-1.5 text-sm font-medium hover:bg-amber-400 disabled:opacity-50">
          {busy ? "Creating…" : "Create user"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
      </div>
    </form>
  );
}
