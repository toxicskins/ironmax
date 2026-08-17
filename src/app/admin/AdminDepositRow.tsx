"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Deposit = {
  id: string; userEmail: string; createdAt: string;
  eurAmount: number; coinsDelta: number; status: string; invoiceId: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "text-emerald-400", PENDING: "text-amber-400", FAILED: "text-red-400",
};

export function AdminDepositRow({ deposit }: { deposit: Deposit }) {
  const [status, setStatus] = useState(deposit.status);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onStatusChange(next: string) {
    setStatus(next);
    setBusy(true);
    await fetch(`/api/admin/deposits/${deposit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-5 gap-2 px-4 py-2 text-sm items-center">
      <span className="text-zinc-400 truncate col-span-2">{deposit.userEmail} — {deposit.createdAt}</span>
      <span>€{deposit.eurAmount.toFixed(2)} → {deposit.coinsDelta}</span>
      <select value={status} disabled={busy} onChange={(e) => onStatusChange(e.target.value)}
        className={`rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs font-semibold disabled:opacity-50 ${STATUS_COLOR[status] ?? ""}`}>
        <option value="PENDING">PENDING</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="FAILED">FAILED</option>
      </select>
      {deposit.invoiceId ? (
        <a href={`/api/invoices/${deposit.invoiceId}`} className="text-amber-400 hover:underline text-xs">Download PDF</a>
      ) : (
        <span className="text-zinc-600 text-xs">—</span>
      )}
    </div>
  );
}
