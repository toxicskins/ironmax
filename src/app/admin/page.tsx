import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminUserRow } from "./AdminUserRow";
import { AdminAddUserForm } from "./AdminAddUserForm";
import { AdminAddDepositForm } from "./AdminAddDepositForm";
import { AdminDepositRow } from "./AdminDepositRow";
import { MailSettingsForm } from "./MailSettingsForm";

export default async function AdminPage() {
  if (!(await requireAdmin())) redirect("/");

  const users = await prisma.user.findMany({
    include: { wallet: true, transactions: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });

  const deposits = await prisma.transaction.findMany({
    where: { type: "DEPOSIT" },
    include: { user: true, invoice: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Admin</h1>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Deposits</h2>
        <AdminAddDepositForm users={users.map((u) => ({ id: u.id, email: u.email }))} />
      </div>
      <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800 mb-10">
        {deposits.map((d) => (
          <AdminDepositRow
            key={d.id}
            deposit={{
              id: d.id,
              userEmail: d.user.email,
              createdAt: d.createdAt.toISOString().slice(0, 16).replace("T", " "),
              eurAmount: Number(d.eurAmount ?? 0),
              coinsDelta: d.coinsDelta,
              status: d.status,
              invoiceId: d.invoice?.id ?? null,
            }}
          />
        ))}
        {deposits.length === 0 && <div className="px-4 py-4 text-sm text-zinc-500">No deposits yet.</div>}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Users</h2>
        <AdminAddUserForm />
      </div>
      <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800 mb-10">
        {users.map((u) => (
          <AdminUserRow key={u.id} user={{
            id: u.id, email: u.email, coins: u.wallet?.coins ?? 0, role: u.role,
            firstName: u.firstName ?? "", lastName: u.lastName ?? "", billingAddress: u.billingAddress ?? "",
          }} />
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Outgoing email</h2>
      <MailSettingsForm />
    </div>
  );
}
