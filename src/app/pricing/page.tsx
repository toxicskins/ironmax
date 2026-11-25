import Link from "next/link";
import { COMPANY, PRICING } from "@/lib/company";
import { LegalPage, Section, List, linkCls } from "../LegalPage";
import { PaymentBadges } from "../PaymentBadges";

export const metadata = { title: "Points Pricing — IRONMAX" };

const eur = (n: number) => `€${n.toFixed(2)}`;

export default function PricingPage() {
  return (
    <LegalPage
      title="Points pricing"
      intro={
        <p>
          Points are sold by {COMPANY.legalName} (Lithuania) at a fixed rate of{" "}
          <strong>{PRICING.pointsPerEur} Points = €1.00</strong>. All prices are in euro (EUR) and are
          the final amount you pay. There are no subscriptions, hidden fees or recurring charges.
        </p>
      }
    >
      <Section title="Popular packages">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border border-zinc-800">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Points</th>
                <th className="px-3 py-2 font-semibold">Price (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {PRICING.packages.map((p) => (
                <tr key={p} className="border-t border-zinc-800">
                  <td className="px-3 py-2">{(p * PRICING.pointsPerEur).toLocaleString("en-US")} Points</td>
                  <td className="px-3 py-2">{eur(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          You can also choose any custom amount from {eur(PRICING.minEur)} to {eur(PRICING.maxEur)} per
          purchase at the same rate. The exact number of Points and the total price are shown in the
          order summary before you pay.
        </p>
      </Section>

      <Section title="Currency and payment methods">
        <List>
          <li>Accepted currency: euro (EUR) only. If your card is in another currency, your bank may apply its own conversion rate and fees.</li>
          <li>Accepted payment methods: Visa and Mastercard credit and debit cards, plus any other method shown at checkout.</li>
          <li>Card payments are processed by our payment provider PayNet Easy on a PCI DSS compliant payment page and are authenticated with 3-D Secure (Visa Secure, Mastercard ID Check).</li>
          <li>Card statement descriptor: {COMPANY.legalName}.</li>
        </List>
        <PaymentBadges className="mt-2" />
      </Section>

      <Section title="What you get">
        <p>
          Points are a virtual balance used only to play the games on IRONMAX. They have no cash value
          and can never be withdrawn, exchanged for money or transferred. Points are credited to your
          account immediately after the payment is confirmed — see the{" "}
          <Link href="/delivery-policy" className={linkCls}>Delivery Policy</Link> and{" "}
          <Link href="/refund-policy" className={linkCls}>Refund Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
