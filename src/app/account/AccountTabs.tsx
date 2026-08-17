"use client";
import { useState } from "react";

export function AccountTabs({ overview, transactions, orders, settings }: { overview: React.ReactNode; transactions: React.ReactNode; orders: React.ReactNode; settings: React.ReactNode }) {
  const [tab, setTab] = useState<"overview" | "transactions" | "orders" | "settings">("overview");
  const tabs: { key: typeof tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "transactions", label: "Transactions" },
    { key: "orders", label: "Orders" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "overview" && overview}
      {tab === "transactions" && transactions}
      {tab === "orders" && orders}
      {tab === "settings" && settings}
    </div>
  );
}
