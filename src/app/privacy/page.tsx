import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { LegalPage, Section, List, linkCls } from "../LegalPage";

export const metadata = { title: "Privacy Policy — IRONMAX" };

export default function PrivacyPage() {
  const mail = <a href={`mailto:${COMPANY.email}`} className={linkCls}>{COMPANY.email}</a>;
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          This Privacy Policy explains how we process your personal data when you use IRONMAX, in line
          with the EU General Data Protection Regulation (Regulation (EU) 2016/679, &quot;GDPR&quot;) and
          the Lithuanian Law on Legal Protection of Personal Data.
        </p>
      }
    >
      <Section title="1. Data controller">
        <p>
          The controller of your personal data is <strong>{COMPANY.legalName}</strong>, registration No.{" "}
          {COMPANY.registerCode}, registered address {COMPANY.address}, {COMPANY.country}. For any privacy
          question or request, contact us at {mail}.
        </p>
      </Section>

      <Section title="2. What data we collect">
        <List>
          <li><strong>Account data:</strong> email address and password (stored only as a secure hash, never in plain text).</li>
          <li><strong>Profile and billing data:</strong> first and last name, billing address, country and phone number entered at checkout.</li>
          <li><strong>Transaction data:</strong> purchase amounts, dates, status, order IDs and invoices.</li>
          <li><strong>Gameplay data:</strong> Points balance, game rounds, seeds and results, needed to run the games and let you verify fairness.</li>
          <li><strong>Technical data:</strong> IP address, browser type and the strictly necessary cookies described in our <Link href="/cookies" className={linkCls}>Cookie Policy</Link>.</li>
          <li><strong>Support data:</strong> messages you send us.</li>
        </List>
        <p>We do not collect or store your card number, expiry date or CVV — see Section 5.</p>
      </Section>

      <Section title="3. Why we use your data and the legal basis">
        <List>
          <li>To create and run your account, sell and deliver Points and run the games — performance of a contract (Art. 6(1)(b) GDPR).</li>
          <li>To issue invoices and keep accounting records, and to meet anti-money-laundering, sanctions and tax obligations — legal obligation (Art. 6(1)(c)).</li>
          <li>To prevent fraud, chargeback abuse and misuse, and to keep the platform secure — our legitimate interests (Art. 6(1)(f)).</li>
          <li>To answer your support requests — contract or legitimate interests.</li>
        </List>
        <p>
          We do not use your data for advertising, profiling or automated decisions that have legal or
          similarly significant effects on you, and we never sell your data.
        </p>
      </Section>

      <Section title="4. Who receives your data">
        <p>We share data only with service providers that help us run IRONMAX, under data processing agreements:</p>
        <List>
          <li>PayNet Easy — payment processing and 3-D Secure authentication;</li>
          <li>Vercel Inc. (USA) — website hosting;</li>
          <li>our database hosting and email delivery providers;</li>
          <li>professional advisers, auditors and public authorities, where required by law.</li>
        </List>
      </Section>

      <Section title="5. Payment security, PCI DSS and 3-D Secure">
        <p>
          Card payments are entered on the secure page of our payment provider, which is certified under
          the Payment Card Industry Data Security Standard (PCI DSS). Card data is sent there directly over
          an encrypted connection and never reaches or is stored on our servers; we receive only the
          payment result and a masked reference. Card payments are verified with 3-D Secure (Visa Secure,
          Mastercard ID Check), so your bank may ask you to confirm the payment in its app or by a one-time
          code.
        </p>
      </Section>

      <Section title="6. Transfers outside the EEA">
        <p>
          Some providers, such as our hosting provider Vercel Inc., are located in or may access data from
          the United States or other countries outside the European Economic Area. We transfer data only
          where the country has an EU adequacy decision (including the EU–US Data Privacy Framework for
          certified companies) or under the European Commission&apos;s Standard Contractual Clauses with
          additional safeguards where needed. You can ask us for a copy of these safeguards at {mail}.
        </p>
      </Section>

      <Section title="7. How long we keep data">
        <List>
          <li>Account, profile and gameplay data: while your account is open and up to 3 years after closure, to handle disputes.</li>
          <li>Transaction records and invoices: 10 years, as required by Lithuanian accounting and tax law.</li>
          <li>Support messages: up to 3 years after the request is resolved.</li>
          <li>Technical logs: up to 12 months.</li>
        </List>
      </Section>

      <Section title="8. Your rights under the GDPR">
        <p>You have the right to:</p>
        <List>
          <li>access your personal data and get a copy of it (Art. 15);</li>
          <li>have inaccurate data corrected (Art. 16);</li>
          <li>have your data erased (&quot;right to be forgotten&quot;), unless we must keep it by law (Art. 17);</li>
          <li>restrict processing (Art. 18);</li>
          <li>data portability — receive your data in a machine-readable format (Art. 20);</li>
          <li>object to processing based on our legitimate interests (Art. 21);</li>
          <li>withdraw any consent you gave, at any time, without affecting earlier processing;</li>
          <li>lodge a complaint with a supervisory authority — in Lithuania, the State Data Protection Inspectorate (Valstybinė duomenų apsaugos inspekcija, L. Sapiegos g. 17, LT-10312 Vilnius, www.vdai.lrv.lt), or the authority in your own EU country.</li>
        </List>
        <p>
          To use these rights, email {mail}. You can also edit your profile in your account settings. We
          answer within one month, free of charge, and may ask you to confirm your identity.
        </p>
      </Section>

      <Section title="9. Security">
        <p>
          We use encrypted HTTPS connections, hashed passwords, access controls and restricted
          administrative access to protect your data.
        </p>
      </Section>

      <Section title="10. Children">
        <p>IRONMAX is only for adults aged 18 or over. We do not knowingly collect data from children.</p>
      </Section>

      <Section title="11. Changes">
        <p>
          We may update this policy. The date at the top shows the latest version; we will email you about
          material changes.
        </p>
      </Section>
    </LegalPage>
  );
}
