import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { LegalPage, Section, List, linkCls } from "../LegalPage";

export const metadata = { title: "Refund Policy — IRONMAX" };

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro={
        <p>
          This policy applies to Points bought from {COMPANY.legalName}, a company registered in the
          Republic of Lithuania (registration No. {COMPANY.registerCode}). It forms part of our{" "}
          <Link href="/terms" className={linkCls}>Terms of Service</Link>.
        </p>
      }
    >
      <Section title="1. When you can get a refund">
        <List>
          <li><strong>Points not delivered.</strong> If you were charged but the Points were not credited and we cannot credit them, you get a full refund.</li>
          <li><strong>Duplicate or wrong charge.</strong> If you were charged twice or charged an amount different from the order summary, the extra amount is refunded in full.</li>
          <li><strong>Unused Points.</strong> You may ask for a refund of a purchase within 14 days of the payment if none of the Points from that purchase have been used.</li>
          <li><strong>Where the law requires it.</strong> Nothing in this policy limits your mandatory rights as a consumer.</li>
        </List>
      </Section>

      <Section title="2. When a refund is not available">
        <p>
          Points are digital content delivered immediately. When you buy them you ask for immediate
          delivery and acknowledge that you lose the statutory 14-day right of withdrawal once delivery
          begins (Article 16(m) of Directive 2011/83/EU). Apart from the cases in Section 1, Points that
          have already been used in games are not refundable. Points are never exchanged for cash.
        </p>
      </Section>

      <Section title="3. How to request a refund">
        <p>
          Email <a href={`mailto:${COMPANY.email}`} className={linkCls}>{COMPANY.email}</a> or use the{" "}
          <Link href="/contact" className={linkCls}>Contact page</Link>, giving your account email, the
          payment date, the amount and the reason. We confirm receipt and give you a decision within 3
          business days.
        </p>
      </Section>

      <Section title="4. How and when refunds are paid">
        <List>
          <li>Approved refunds go back to the card used for the original payment, in euro (EUR). We do not refund to a different card, account or person.</li>
          <li>We send the refund within 5 business days of approval. Your bank usually shows it within 5–10 business days after that.</li>
          <li>The refunded Points are removed from your balance.</li>
        </List>
      </Section>

      <Section title="5. Chargebacks">
        <p>
          Please contact us before disputing a payment with your bank — most issues are solved faster
          that way. How we handle chargebacks is described in Section 11 of the{" "}
          <Link href="/terms" className={linkCls}>Terms of Service</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
