import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { LegalPage, Section, List, linkCls } from "../LegalPage";

export const metadata = { title: "Delivery Policy — IRONMAX" };

export default function DeliveryPolicyPage() {
  return (
    <LegalPage
      title="Delivery Policy"
      intro={
        <p>
          This policy explains how and when Points bought from {COMPANY.legalName} (registration No.{" "}
          {COMPANY.registerCode}, {COMPANY.address}, Lithuania) are delivered.
        </p>
      }
    >
      <Section title="1. What is delivered">
        <p>
          IRONMAX sells digital content only: Points credited to your IRONMAX account. Nothing is
          shipped physically and no delivery fees apply.
        </p>
      </Section>

      <Section title="2. How and when Points are credited">
        <List>
          <li>Points are credited automatically to the account you were signed in to when you paid.</li>
          <li>Delivery is normally instant — within a few seconds of the payment provider confirming the payment.</li>
          <li>In rare cases (bank or 3-D Secure delays) crediting can take up to 30 minutes.</li>
          <li>You will see the new balance in <Link href="/account" className={linkCls}>My account</Link>, together with the transaction and a downloadable invoice.</li>
        </List>
      </Section>

      <Section title="3. If your Points have not arrived">
        <p>
          If your card was charged but the Points are not on your balance after 30 minutes, contact us at{" "}
          <a href={`mailto:${COMPANY.email}`} className={linkCls}>{COMPANY.email}</a> with your account
          email, the payment date and the amount. We reply within 2 business days and will either credit
          the Points or, if delivery is not possible, refund the payment in full to the original card as
          described in the <Link href="/refund-policy" className={linkCls}>Refund Policy</Link>.
        </p>
      </Section>

      <Section title="4. Failed or declined payments">
        <p>
          If a payment is declined, cancelled or fails 3-D Secure authentication, no Points are credited
          and you are not charged. Any temporary authorisation hold is released by your bank, usually
          within a few business days.
        </p>
      </Section>
    </LegalPage>
  );
}
