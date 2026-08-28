import { COMPANY } from "@/lib/company";

export const metadata = { title: "Privacy Policy — IRONMAX" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
      <p className="text-sm text-zinc-500 mb-8">Last updated 2026</p>

      <div className="flex flex-col gap-6 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">What we collect</h2>
          <p>
            Account email and password (stored hashed, never in plain text), optional profile
            details you choose to add (name, billing address), wallet balances and transaction
            history, and gameplay records (bets, seeds, and outcomes) needed to run the games and
            let you verify fairness.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Why we collect it</h2>
          <p>
            To operate your account, process point top-ups, generate invoices, run the games, and
            respond to support requests. We don&apos;t use your data for anything beyond running
            the platform — no ad targeting, no selling data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Payments</h2>
          <p>
            Point purchases are processed by PayNet Easy. We never see or store your card details —
            they're handled entirely by the payment processor.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Your rights</h2>
          <p>
            You can view and edit your profile details from your account settings at any time. To
            request a copy of your data or account deletion, contact us at{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-amber-400 hover:underline">{COMPANY.email}</a>{" "}
            or via the <a href="/contact" className="text-amber-400 hover:underline">Contact page</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Cookies</h2>
          <p>
            We use only the session cookie required to keep you logged in. No third-party tracking
            or advertising cookies are set by IRONMAX.
          </p>
        </section>
      </div>
    </div>
  );
}
