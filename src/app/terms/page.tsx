export const metadata = { title: "Terms of Service — IRONMAX" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 prose-invert">
      <h1 className="text-3xl font-extrabold mb-2">Terms of Service</h1>
      <p className="text-sm text-zinc-500 mb-8">Last updated 2026</p>

      <div className="flex flex-col gap-6 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. About IRONMAX</h2>
          <p>
            IRONMAX is a social casino: a game-for-fun entertainment platform operated by{" "}
            <strong>—</strong> ("we", "us", "our", the "Company"). IRONMAX lets customers play
            casino-style games using Points. Points have <strong>no cash value</strong> and cannot
            be withdrawn, redeemed, exchanged, or cashed out under any circumstance, regardless of
            balance. IRONMAX is entertainment software and does not offer real-money gambling,
            wagering, or betting services. By creating an account or using IRONMAX, you agree to
            be bound by these Terms of Service ("Terms"). If you do not agree, do not use the
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Eligibility</h2>
          <p>
            You must be at least 18 years old, or the age of majority in your jurisdiction if
            higher, to create an account or make a purchase on IRONMAX. By using IRONMAX you
            represent and warrant that you meet this requirement, that you are legally permitted
            to use the platform under the laws applicable to you, and that all information you
            provide during registration is accurate and complete. We may request proof of age or
            identity at any time and may restrict or close accounts where eligibility cannot be
            verified.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Accounts</h2>
          <p>
            You may only maintain one account per person. You are responsible for keeping your
            login credentials confidential and for all activity that occurs under your account,
            whether or not authorized by you. Notify us immediately if you suspect unauthorized
            access, a compromised password, or any other security breach. We are not liable for
            losses arising from your failure to safeguard your account credentials.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Fair play &amp; game outcomes</h2>
          <p>
            Every bet outcome on IRONMAX is generated from a server seed and a client seed
            combined via HMAC-SHA256, so results can be independently verified after the fact.
            Games are configured to a fixed, published return-to-player rate over the long run;
            individual sessions may vary. Attempting to exploit, probe, reverse-engineer, or
            manipulate the random number generation, game logic, or payout mechanics is a breach
            of these Terms and may result in immediate suspension, forfeiture of Points, and
            account closure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Prohibited conduct</h2>
          <p>You agree not to, and not to attempt to:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
            <li>create or control multiple accounts, or use another person's account;</li>
            <li>use bots, scripts, automation, or any tool to interact with the platform;</li>
            <li>exploit bugs, glitches, or misconfigurations instead of reporting them;</li>
            <li>use IRONMAX for money laundering, fraud, or any unlawful purpose;</li>
            <li>reverse-engineer, decompile, or scrape the platform or its game logic;</li>
            <li>interfere with the platform's operation, security, or other users' access;</li>
            <li>misrepresent your identity, age, or payment information.</li>
          </ul>
          <p className="mt-2">
            Violation of this section may result in suspension or termination of your account and
            forfeiture of Points under Section 8.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">6. Intellectual property</h2>
          <p>
            All software, graphics, game designs, text, logos, and other content on IRONMAX are
            owned by or licensed to the Company and are protected by intellectual property laws.
            You are granted a limited, personal, non-exclusive, non-transferable license to access
            and use IRONMAX for your own entertainment. You may not copy, modify, distribute,
            sell, or create derivative works from any part of the platform without our prior
            written consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">7. Disclaimers &amp; limitation of liability</h2>
          <p>
            IRONMAX is provided "as is" and "as available" without warranties of any kind, express
            or implied, including fitness for a particular purpose, non-infringement, or
            uninterrupted, error-free operation. To the maximum extent permitted by applicable
            law, the Company shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or for any loss of data, goodwill, or Points
            arising from your use of, or inability to use, IRONMAX. Nothing in these Terms limits
            liability that cannot lawfully be excluded, such as liability for fraud or death or
            personal injury caused by negligence.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">8. Suspension &amp; termination</h2>
          <p>
            We may suspend, restrict, or close any account, at our discretion, where we
            reasonably believe these Terms have been violated, where fraud, abuse, chargebacks, or
            unlawful activity is suspected, or where required by law or a payment provider. Points
            forfeited on closure for cause have no cash value and no refund is owed. You may close
            your account at any time by contacting us; any unused Points will be forfeited on
            voluntary closure, subject to applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">9. Governing law &amp; disputes</h2>
          <p>
            These Terms are governed by the laws applicable to the Company's place of
            registration, without regard to conflict-of-law principles, except where mandatory
            consumer-protection law in your country of residence provides otherwise. Any dispute
            arising from these Terms or your use of IRONMAX shall first be addressed through good-
            faith negotiation with our support team before either party pursues formal proceedings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">10. Points &amp; Payments</h2>
          <p>
            The website may allow customers to purchase or receive Points that may be used solely
            to purchase eligible products or services available on the IRONMAX platform. Points
            are digital units intended exclusively for use within the IRONMAX platform.
          </p>
          <p className="mt-2">Points:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
            <li>are not money, electronic money, cryptocurrency, or a bank deposit;</li>
            <li>do not represent stored monetary value or funds held on behalf of the customer;</li>
            <li>have no monetary or cash value outside the IRONMAX platform;</li>
            <li>cannot be exchanged or redeemed for cash;</li>
            <li>
              cannot be withdrawn to a bank account, payment card, payment provider,
              cryptocurrency account, or any other external payment method;
            </li>
            <li>cannot be transferred, sold, assigned, traded, or exchanged between users;</li>
            <li>may only be used toward eligible purchases available on the IRONMAX platform;</li>
            <li>
              are non-refundable once purchased or added to the customer&apos;s account, except
              where required by applicable law or where a refund is explicitly approved by{" "}
              <strong>—</strong>.
            </li>
          </ul>
          <p className="mt-3">
            Customers may buy Points to their account using the payment methods made available on
            the IRONMAX platform. Purchasing or receiving Points does not create a bank account,
            payment account, stored-value account, electronic money account, or other financial
            account with <strong>—</strong>.
          </p>
          <p className="mt-2">
            Unused Points will remain available in the customer&apos;s account until they are
            used, subject to these Terms and any applicable account restrictions.
          </p>
          <p className="mt-2">
            Where a purchase made using Points is eligible for a refund, <strong>—</strong>{" "}
            reserves the right, where permitted by applicable law, to return the corresponding
            Points to the customer&apos;s account rather than provide cash or a refund to an
            external payment method.
          </p>
          <p className="mt-2">
            We reserve the right to suspend, restrict, correct, remove, or adjust Points where
            reasonably necessary to address technical errors, duplicate Points, chargebacks,
            payment reversals, fraudulent activity, abuse, or violations of these Terms.
          </p>
          <p className="mt-2">
            Points may not be purchased, obtained, transferred, or used for resale, money
            transmission, currency exchange, arbitrage, or any other unauthorised commercial or
            financial purpose.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">11. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time to reflect changes in our platform, legal
            requirements, or business practices. Material changes will be indicated by an updated
            "Last updated" date above. Continued use of IRONMAX after a change is published means
            you accept the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">12. Contact</h2>
          <p>
            Questions about these Terms can be directed to our support team via the{" "}
            <a href="/contact" className="text-amber-400 hover:underline">Contact</a> page.
          </p>
        </section>
      </div>
    </div>
  );
}
