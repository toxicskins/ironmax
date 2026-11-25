import Link from "next/link";
import { COMPANY, PRICING, PROHIBITED_COUNTRIES } from "@/lib/company";
import { LegalPage, Section, List, linkCls } from "../LegalPage";

export const metadata = { title: "Terms of Service — IRONMAX" };

export default function TermsPage() {
  const operator = <strong>{COMPANY.legalName}</strong>;
  return (
    <LegalPage title="Terms of Service">
      <Section title="1. About IRONMAX and the operator">
        <p>
          IRONMAX is a social casino: an entertainment platform where you play casino-style games with
          Points. The platform is operated by {operator}, a private limited company registered in the
          Republic of Lithuania under registration No. {COMPANY.registerCode}, with its registered
          address at {COMPANY.address}, Lithuania, email{" "}
          <a href={`mailto:${COMPANY.email}`} className={linkCls}>{COMPANY.email}</a> (&quot;we&quot;,
          &quot;us&quot;, the &quot;Company&quot;).
        </p>
        <p>
          <strong>IRONMAX is not a gambling service.</strong> Points have no cash value and can never be
          withdrawn, redeemed, exchanged or cashed out, whatever the balance. You cannot win money or
          anything of monetary value. What you pay for is the entertainment of playing.
        </p>
        <p>
          By creating an account or buying Points you agree to these Terms, our{" "}
          <Link href="/privacy" className={linkCls}>Privacy Policy</Link>,{" "}
          <Link href="/refund-policy" className={linkCls}>Refund Policy</Link> and{" "}
          <Link href="/delivery-policy" className={linkCls}>Delivery Policy</Link>. If you do not agree,
          do not use IRONMAX.
        </p>
      </Section>

      <Section title="2. Eligibility and prohibited countries">
        <p>
          You must be at least 18 years old, or the age of majority in your country if higher. You
          confirm that using IRONMAX is lawful where you live and that the information you give us is
          accurate. We may ask for proof of age or identity and may restrict accounts that cannot be
          verified.
        </p>
        <p>IRONMAX is not available to residents of, or people located in:</p>
        <List>
          {PROHIBITED_COUNTRIES.map((c) => <li key={c}>{c};</li>)}
          <li>any other country or territory subject to comprehensive EU, UN or US sanctions, or where social casino games or the purchase of virtual currency for them is prohibited.</li>
        </List>
        <p>Accounts opened from these locations, including through a VPN, may be closed and purchases refunded.</p>
      </Section>

      <Section title="3. Accounts">
        <p>
          One account per person. Keep your login details confidential; you are responsible for activity
          on your account. Tell us immediately if you suspect unauthorised access.
        </p>
      </Section>

      <Section title="4. Points, prices and payments">
        <List>
          <li>Points are sold at a fixed rate of {PRICING.pointsPerEur} Points = €1.00, in amounts from €{PRICING.minEur} to €{PRICING.maxEur} per purchase. Current prices are on the <Link href="/pricing" className={linkCls}>Pricing page</Link> and the total is shown in the order summary before you pay.</li>
          <li><strong>Accepted currency:</strong> euro (EUR) only. Your bank may charge conversion fees if your card is in another currency.</li>
          <li><strong>Payment methods:</strong> Visa and Mastercard credit and debit cards, and any other method shown at checkout. Payments are processed by PayNet Easy on a PCI DSS compliant payment page and are authenticated with 3-D Secure.</li>
          <li>Your card statement shows &quot;{COMPANY.legalName}&quot;.</li>
          <li>Points are not money, electronic money, cryptocurrency, a deposit or stored value. They cannot be transferred, sold or traded between users and can be used only to play games on IRONMAX.</li>
          <li>Buying Points does not open a bank, payment or e-money account with the Company.</li>
          <li>Points may not be bought or used for resale, money transmission, arbitrage or any other commercial purpose.</li>
        </List>
      </Section>

      <Section title="5. Delivery of Points">
        <p>
          Points are credited to your account automatically, normally within seconds and at most within
          30 minutes of the payment being confirmed. Details are in the{" "}
          <Link href="/delivery-policy" className={linkCls}>Delivery Policy</Link>.
        </p>
      </Section>

      <Section title="6. Refunds and right of withdrawal">
        <p>
          Points are digital content delivered immediately at your request. At checkout you agree to
          immediate delivery and acknowledge that you lose the 14-day right of withdrawal once delivery
          begins. You can still get a refund for Points that were not delivered, for duplicate or
          incorrect charges, and for purchases whose Points are completely unused within 14 days. Refunds
          are paid to the original card within 5 business days of approval. The full process is in the{" "}
          <Link href="/refund-policy" className={linkCls}>Refund Policy</Link>.
        </p>
      </Section>

      <Section title="7. Games and fair play">
        <p>
          Each game round costs the number of Points you choose and may award more Points according to
          the rules and prize table shown in the game. Prizes are only ever Points. Round results are
          generated from a server seed and a client seed combined with HMAC-SHA256, so they can be
          verified afterwards. Trying to exploit, probe or manipulate the random number generation or
          game logic breaches these Terms.
        </p>
      </Section>

      <Section title="8. Prohibited conduct">
        <p>You agree not to:</p>
        <List>
          <li>create or control several accounts, or use someone else&apos;s account;</li>
          <li>use bots, scripts or other automation;</li>
          <li>exploit bugs instead of reporting them;</li>
          <li>use IRONMAX for money laundering, fraud or any unlawful purpose;</li>
          <li>reverse-engineer, decompile or scrape the platform;</li>
          <li>interfere with the platform&apos;s operation or security;</li>
          <li>misrepresent your identity, age, location or payment details.</li>
        </List>
      </Section>

      <Section title="9. Intellectual property">
        <p>
          All software, graphics, game designs, text and logos on IRONMAX belong to or are licensed to the
          Company. You get a personal, non-transferable licence to use IRONMAX for your own entertainment.
        </p>
      </Section>

      <Section title="10. Liability">
        <p>
          IRONMAX is provided &quot;as is&quot;. To the extent permitted by law, the Company is not liable
          for indirect or consequential loss, or for loss of Points caused by your misuse of the platform.
          Nothing in these Terms limits liability that cannot be excluded by law, or your mandatory rights
          as a consumer.
        </p>
      </Section>

      <Section title="11. Failed payments, non-delivery and chargebacks">
        <List>
          <li><strong>Payment not completed:</strong> if a payment is declined, cancelled or fails 3-D Secure, no Points are credited and nothing is owed.</li>
          <li><strong>Points not delivered:</strong> if you were charged but did not receive your Points, we credit them or refund you in full, as set out in the Refund Policy.</li>
          <li><strong>Payment reversed later:</strong> if a completed payment is reversed or charged back, the Points from that payment are removed from your balance. If they were already used, the balance may become negative and must be settled before you can buy again.</li>
          <li><strong>Chargebacks:</strong> please contact us first — we try to resolve every complaint within 3 business days. When a chargeback is opened we may suspend the account while we answer it with the card issuer. A chargeback filed without first contacting us, or found to be unjustified, may lead to account closure. Accounts with justified chargebacks are not penalised.</li>
        </List>
      </Section>

      <Section title="12. Suspension and closing your account">
        <p>
          <strong>Closing by you:</strong> you may close your account at any time by emailing us. Closure
          takes effect within 5 business days. Unused Points are lost on closure, but you may first ask
          for a refund of eligible unused purchases under the Refund Policy.
        </p>
        <p>
          <strong>Closing by us:</strong> we may close an account for any reason by giving you at least 30
          days&apos; notice by email. During that period you can still use your Points or ask for a refund
          of eligible unused purchases. We may suspend or close an account immediately, without notice, if
          we reasonably suspect fraud, abuse, a breach of these Terms, use from a prohibited country, or if
          the law or our payment provider requires it.
        </p>
      </Section>

      <Section title="13. Governing law and disputes">
        <p>
          These Terms are governed by the laws of the Republic of Lithuania. If you are a consumer, you
          keep the protection of the mandatory laws of your country of residence. Please contact us first
          with any complaint; we reply within 14 days. Consumers may also turn to the State Consumer Rights
          Protection Authority of Lithuania (Valstybinė vartotojų teisių apsaugos tarnyba, www.vvtat.lt)
          for out-of-court dispute resolution. Disputes that cannot be settled go to the competent courts
          of the Republic of Lithuania, without affecting a consumer&apos;s right to sue in their home
          country.
        </p>
      </Section>

      <Section title="14. Changes to these Terms">
        <p>
          We may update these Terms. Material changes are announced by email or on the website at least 14
          days in advance and are shown by a new &quot;Last updated&quot; date. Changes never apply to
          purchases made before they take effect.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          {COMPANY.legalName}, {COMPANY.address}, Lithuania. Email:{" "}
          <a href={`mailto:${COMPANY.email}`} className={linkCls}>{COMPANY.email}</a>. Support hours:{" "}
          {COMPANY.supportHours}. You can also use the <Link href="/contact" className={linkCls}>Contact page</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
