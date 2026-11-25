import Link from "next/link";
import { COMPANY, COOKIE_CHOICE_NAME } from "@/lib/company";
import { LegalPage, Section, linkCls } from "../LegalPage";

export const metadata = { title: "Cookie Policy — IRONMAX" };

// On HTTPS Auth.js adds the __Secure- / __Host- prefixes to these names.
const COOKIES = [
  {
    name: "authjs.session-token",
    purpose: "Keeps you signed in to your account (encrypted session token).",
    type: "Strictly necessary",
    duration: "30 days, or until you log out",
  },
  {
    name: "authjs.csrf-token",
    purpose: "Protects the login and account forms against cross-site request forgery.",
    type: "Strictly necessary",
    duration: "Session (deleted when you close the browser)",
  },
  {
    name: "authjs.callback-url",
    purpose: "Remembers which page to return you to after you log in.",
    type: "Strictly necessary",
    duration: "Session",
  },
  {
    name: COOKIE_CHOICE_NAME,
    purpose: "Remembers that you have seen the cookie notice and your choice.",
    type: "Strictly necessary",
    duration: "12 months",
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro={
        <p>
          This policy explains how {COMPANY.legalName} (registration No. {COMPANY.registerCode},{" "}
          {COMPANY.address}, Lithuania), the controller of this website, uses cookies. Cookies are small
          text files stored by your browser.
        </p>
      }
    >
      <Section title="1. Cookies we use">
        <p>
          IRONMAX uses only first-party cookies that are strictly necessary for the website to work. We
          do not use analytics, advertising, social-media or other tracking cookies.
        </p>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs sm:text-sm border border-zinc-800">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Cookie</th>
                <th className="px-3 py-2 font-semibold">Purpose</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.name} className="border-t border-zinc-800 align-top">
                  <td className="px-3 py-2 font-mono break-all">{c.name}</td>
                  <td className="px-3 py-2">{c.purpose}</td>
                  <td className="px-3 py-2">{c.type}</td>
                  <td className="px-3 py-2">{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500">
          On secure connections the first three cookie names carry a <code>__Secure-</code> or{" "}
          <code>__Host-</code> prefix.
        </p>
      </Section>

      <Section title="2. Third-party cookies">
        <p>
          When you pay, you are redirected to the payment page of our payment provider PayNet Easy and,
          for 3-D Secure, to your card issuer. Those pages may set their own cookies, which are governed
          by their own cookie policies.
        </p>
      </Section>

      <Section title="3. Legal basis and your choices">
        <p>
          Strictly necessary cookies do not require consent under the Lithuanian Law on Electronic
          Communications and the ePrivacy Directive. If we ever add optional cookies, we will
          ask for your consent first through the cookie banner. You can delete or block cookies in your
          browser settings at any time, but you will then not be able to stay signed in.
        </p>
      </Section>

      <Section title="4. Contact">
        <p>
          Questions about cookies: <a href={`mailto:${COMPANY.email}`} className={linkCls}>{COMPANY.email}</a>.
          See also our <Link href="/privacy" className={linkCls}>Privacy Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
