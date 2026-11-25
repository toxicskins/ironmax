import { COMPANY } from "@/lib/company";

export const metadata = { title: "Contact — IRONMAX" };

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Contact us</h1>
      <p className="text-zinc-400 mb-8">Questions about your account, a game round, or a Points purchase — reach us using the details below.</p>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="text-xs uppercase text-zinc-500 mb-1">Support email</div>
          <a href={`mailto:${COMPANY.email}`} className="text-amber-400 hover:underline">{COMPANY.email}</a>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="text-xs uppercase text-zinc-500 mb-1">Support hours</div>
          <p className="text-sm text-zinc-300">{COMPANY.supportHours}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="text-xs uppercase text-zinc-500 mb-1">Merchant</div>
          <p className="text-sm text-zinc-300">{COMPANY.legalName}</p>
          <p className="text-sm text-zinc-500">{COMPANY.address}, Lithuania</p>
          <p className="text-sm text-zinc-500">Registration No.: {COMPANY.registerCode}</p>
        </div>
      </div>
    </div>
  );
}
