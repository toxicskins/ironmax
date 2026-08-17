"use client";
import { useState } from "react";
import Link from "next/link";

type Billing = {
  firstName: string; lastName: string;
  street: string; city: string; postalCode: string; country: string;
  phone: string;
};

const EMPTY_BILLING: Billing = {
  firstName: "", lastName: "",
  street: "", city: "", postalCode: "", country: "",
  phone: "",
};

// EU member states + UK — the digital-goods withdrawal waiver checkbox is a consumer-rights
// disclosure required only in these jurisdictions, so it's shown conditionally on this set.
const EU_UK_COUNTRIES = new Set([
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia",
  "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia",
  "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania",
  "Slovakia", "Slovenia", "Spain", "Sweden", "United Kingdom",
]);

const OTHER_COUNTRIES = [
  "United States", "Canada", "Australia", "Switzerland", "Norway", "Ukraine", "Turkey",
  "Brazil", "Mexico", "Japan", "South Korea", "India", "Other",
];

const COUNTRIES = [...EU_UK_COUNTRIES, ...OTHER_COUNTRIES];

export function DepositForm({ profileFirstName, profileLastName }: { profileFirstName?: string; profileLastName?: string }) {
  const [amount, setAmount] = useState(10);
  const [step, setStep] = useState<"amount" | "checkout">("amount");
  const [billing, setBilling] = useState<Billing>({
    ...EMPTY_BILLING,
    firstName: profileFirstName ?? "",
    lastName: profileLastName ?? "",
  });
  const [agreed, setAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const points = amount * 100;
  const requiresWaiver = EU_UK_COUNTRIES.has(billing.country);
  const billingComplete = Object.values(billing).every((v) => v.trim().length > 0);
  const canPay = billingComplete && termsAgreed && (!requiresWaiver || agreed);

  function updateBilling<K extends keyof Billing>(key: K, value: string) {
    setBilling((b) => ({ ...b, [key]: value }));
  }

  async function onDeposit() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eurAmount: amount, billing }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) { setError(body.error ?? "Deposit failed"); return; }
    window.location.href = body.paymentUrl;
  }

  if (step === "amount") {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="text-sm text-zinc-400 mb-2">Top up (100 points = €1)</div>
        <div className="flex items-center gap-3">
          <input type="number" min={1} max={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
            className="w-24 rounded border border-zinc-700 bg-zinc-950 px-2 py-1" />
          <span className="text-zinc-500 text-sm">€ → {points} points</span>
          <button onClick={() => setStep("checkout")}
            className="ml-auto rounded bg-amber-500 text-zinc-950 font-medium px-4 py-1.5 hover:bg-amber-400">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">Checkout — {points} points for €{amount.toFixed(2)}</div>
        <button onClick={() => setStep("amount")} className="text-xs text-zinc-500 hover:text-amber-400">← Change amount</button>
      </div>

      {/* Billing details */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Billing details</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="First name" value={billing.firstName} onChange={(e) => updateBilling("firstName", e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input placeholder="Last name" value={billing.lastName} onChange={(e) => updateBilling("lastName", e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input placeholder="Street address" value={billing.street} onChange={(e) => updateBilling("street", e.target.value)}
            className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input placeholder="City" value={billing.city} onChange={(e) => updateBilling("city", e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input placeholder="Postal code" value={billing.postalCode} onChange={(e) => updateBilling("postalCode", e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <select value={billing.country} onChange={(e) => updateBilling("country", e.target.value)}
            className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100">
            <option value="" disabled>Country</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Phone number" value={billing.phone} onChange={(e) => updateBilling("phone", e.target.value)}
            className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Legal: about points */}
      <div className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-800 pt-4">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">About points</h4>
        <p>
          Points are a virtual in-platform balance used only to play games on IRONMAX. Points have no cash
          value, cannot be exchanged for money, transferred to another account, or withdrawn under any
          circumstance. Purchased points are non-refundable once credited, except where required by
          applicable law. Points already in your account remain available until spent.
        </p>
      </div>

      {/* Legal: payment provider */}
      <div className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-800 pt-4">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">Payment system — PayNet Easy</h4>
        <p>
          Pay securely using your credit card. Payments are processed by PayNet Easy. We do not store your
          full card details — every transaction is tokenized and handled in compliance with PCI-DSS
          standards. You&apos;ll be redirected to a secure page to enter your card information.
        </p>
        <p className="mt-2">Card statement descriptor: <span className="text-zinc-400">—</span></p>
      </div>

      {/* Digital goods waiver — only a required disclosure for EU/UK consumers */}
      {requiresWaiver && (
        <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0" />
          <span>
            I understand that by purchasing digital goods and requesting immediate delivery, I waive my
            statutory right of withdrawal once delivery begins. <span className="text-red-400">*</span>
            <span className="block text-zinc-600 mt-0.5">Required for EU/UK customers purchasing digital content.</span>
          </span>
        </label>
      )}

      {/* Terms & Privacy */}
      <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer">
        <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0" />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-amber-400 hover:underline">Terms</Link> and{" "}
          <Link href="/privacy" className="text-amber-400 hover:underline">Privacy Policy</Link>.
        </span>
      </label>

      {/* Order summary */}
      <div className="border-t border-zinc-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-1">Order summary</h3>
        <p className="text-xs text-zinc-500 mb-3">Review and confirm your points purchase before proceeding to card payment.</p>
        <div className="rounded border border-zinc-800 bg-zinc-950 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-300">{points} Points</span>
            <span className="text-zinc-500">Quantity: 1</span>
            <span className="text-zinc-300">€{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-zinc-800 font-semibold">
            <span className="text-white">Total</span>
            <span className="text-amber-400">€{amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={onDeposit} disabled={loading || !canPay}
        className="w-full rounded bg-amber-500 text-zinc-950 font-semibold py-2.5 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Redirecting..." : "Pay with PayNet Easy"}
      </button>
    </div>
  );
}
