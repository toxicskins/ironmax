import { COMPANY } from "@/lib/company";

export const metadata = { title: "Contact — IRONMAX" };

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Contact us</h1>
      <p className="text-zinc-400 mb-8">Questions about your account, a bet, or a top-up — reach us using the details below.</p>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="text-xs uppercase text-zinc-500 mb-1">Support email</div>
          <p className="text-amber-400">—</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="text-xs uppercase text-zinc-500 mb-1">Support hours</div>
          <p className="text-sm text-zinc-300">Mon–Fri, 9:00–18:00 (UTC)</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="text-xs uppercase text-zinc-500 mb-1">Company</div>
          <p className="text-sm text-zinc-300">{COMPANY.legalName}</p>
          <p className="text-sm text-zinc-500">{COMPANY.address}</p>
        </div>
      </div>
    </div>
  );
}
