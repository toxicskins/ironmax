import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DepositForm } from "./DepositForm";
import { AccountTabs } from "./AccountTabs";
import { SettingsForm } from "./SettingsForm";
import { FloatingOrbs } from "../FloatingOrbs";

export default async function AccountPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const [wallet, transactions, orders, user] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.transaction.findMany({
      where: { userId, type: "DEPOSIT" },
      orderBy: { createdAt: "desc" },
      include: { invoice: true },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  const overview = (
    <div>
      <div className="relative mb-8 rounded-2xl overflow-hidden border border-amber-500/20 px-5 py-5">
        <div
          className="absolute inset-0 -z-10"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 80% at 20% 0%, rgba(245,158,11,0.25) 0%, transparent 60%), linear-gradient(180deg, #1a1005 0%, #0a0a0c 100%)" }}
        />
        <FloatingOrbs />
        <div className="text-xs uppercase tracking-wide text-zinc-500">Points</div>
        <div className="text-3xl font-extrabold text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">{wallet?.coins ?? 0}</div>
      </div>
      <DepositForm profileFirstName={user?.firstName ?? ""} profileLastName={user?.lastName ?? ""} />
    </div>
  );

  const transactionsTab = (
    <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
      {transactions.map((t) => (
        <div key={t.id} className="flex justify-between px-4 py-2 text-sm">
          <span className="text-zinc-400">{t.type} — {t.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
          <span className={t.coinsDelta >= 0 ? "text-emerald-400" : "text-red-400"}>
            {t.coinsDelta >= 0 ? "+" : ""}{t.coinsDelta}
          </span>
        </div>
      ))}
      {transactions.length === 0 && <div className="px-4 py-4 text-sm text-zinc-500">No transactions yet.</div>}
    </div>
  );

  const ordersTab = (
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-800">
        <span>Date</span>
        <span>Points</span>
        <span>Status</span>
        <span>Invoice</span>
      </div>
      <div className="divide-y divide-zinc-800">
        {orders.map((o) => (
          <div key={o.id} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm items-center">
            <span className="text-zinc-400">{o.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
            <span className="text-zinc-100 font-medium">{o.coinsDelta.toLocaleString("en-US")}</span>
            <span className={
              o.status === "COMPLETED" ? "text-emerald-400" : o.status === "FAILED" ? "text-red-400" : "text-amber-400"
            }>
              {o.status}
            </span>
            {o.invoice ? (
              <a href={`/api/invoices/${o.invoice.id}`} className="text-amber-400 hover:underline">Download PDF</a>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </div>
        ))}
        {orders.length === 0 && <div className="px-4 py-4 text-sm text-zinc-500">No orders yet.</div>}
      </div>
    </div>
  );

  const settingsTab = (
    <SettingsForm profile={{
      email: user!.email,
      firstName: user!.firstName ?? "",
      lastName: user!.lastName ?? "",
    }} />
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">My account</h1>
      <AccountTabs overview={overview} transactions={transactionsTab} orders={ordersTab} settings={settingsTab} />
    </div>
  );
}
