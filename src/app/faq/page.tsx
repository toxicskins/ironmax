import Link from "next/link";
import { COMPANY, PRICING, PROHIBITED_COUNTRIES } from "@/lib/company";
import { LegalPage, linkCls } from "../LegalPage";

export const metadata = { title: "FAQ — IRONMAX" };

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is IRONMAX?",
    a: <>A social casino: casino-style games played with Points, purely for entertainment. You cannot win money or anything of cash value.</>,
  },
  {
    q: "Who runs IRONMAX?",
    a: <>{COMPANY.legalName}, a company registered in the Republic of Lithuania (registration No. {COMPANY.registerCode}, {COMPANY.address}).</>,
  },
  {
    q: "How much do Points cost?",
    a: <>{PRICING.pointsPerEur} Points = €1.00. You can buy from €{PRICING.minEur} to €{PRICING.maxEur} at a time. See the <Link href="/pricing" className={linkCls}>Pricing page</Link>.</>,
  },
  {
    q: "Which currencies and payment methods do you accept?",
    a: <>Prices are in euro (EUR) only. We accept Visa and Mastercard credit and debit cards, plus any other method shown at checkout. Card payments are protected by 3-D Secure.</>,
  },
  {
    q: "Is my card data safe?",
    a: <>Yes. You enter your card details on the PCI DSS compliant page of our payment provider PayNet Easy. We never see or store your full card number or CVV.</>,
  },
  {
    q: "Can I withdraw or cash out Points?",
    a: <>No. Points have no cash value and can never be withdrawn, exchanged for money or transferred to another user.</>,
  },
  {
    q: "When will I receive my Points?",
    a: <>Usually instantly, at most within 30 minutes after the payment is confirmed. If they have not arrived, email us — see the <Link href="/delivery-policy" className={linkCls}>Delivery Policy</Link>.</>,
  },
  {
    q: "Can I get a refund?",
    a: <>Yes, if Points were not delivered, if you were charged twice or the wrong amount, or within 14 days for a purchase whose Points are all unused. Refunds go back to your card within 5 business days of approval. See the <Link href="/refund-policy" className={linkCls}>Refund Policy</Link>.</>,
  },
  {
    q: "What will appear on my card statement?",
    a: <>{COMPANY.legalName}.</>,
  },
  {
    q: "Who can play?",
    a: <>Adults aged 18 or over. IRONMAX is not available in {PROHIBITED_COUNTRIES.slice(0, -1).join(", ")}, {PROHIBITED_COUNTRIES.at(-1)}, or other sanctioned territories.</>,
  },
  {
    q: "How do I close my account?",
    a: <>Email us from your account address; we close it within 5 business days. Details are in Section 12 of the <Link href="/terms" className={linkCls}>Terms of Service</Link>.</>,
  },
  {
    q: "How do I contact support?",
    a: <>Email <a href={`mailto:${COMPANY.email}`} className={linkCls}>{COMPANY.email}</a> ({COMPANY.supportHours}) or use the <Link href="/contact" className={linkCls}>Contact page</Link>.</>,
  },
];

export default function FaqPage() {
  return (
    <LegalPage title="Frequently asked questions">
      {FAQ.map(({ q, a }) => (
        <details key={q} className="group rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-white list-none flex justify-between gap-4">
            {q}
            <span className="text-amber-400 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="mt-2 text-zinc-300">{a}</p>
        </details>
      ))}
    </LegalPage>
  );
}
