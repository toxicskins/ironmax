import { LEGAL_UPDATED } from "@/lib/company";

/** Shared shell for policy pages so headings, spacing and the "last updated" date stay consistent. */
export function LegalPage({ title, intro, children }: { title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-2">{title}</h1>
      <p className="text-sm text-zinc-500 mb-8">Last updated: {LEGAL_UPDATED}</p>
      {intro && <div className="text-zinc-300 text-sm leading-relaxed mb-6">{intro}</div>}
      <div className="flex flex-col gap-6 text-zinc-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

export function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 flex flex-col gap-1">{children}</ul>;
}

export const linkCls = "text-amber-400 hover:underline";
