import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Fragment } from "react";
import { Logo } from "./Logo";
import { HeaderNav } from "./HeaderNav";
import { SessionProviderWrapper } from "./SessionProviderWrapper";
import { PaymentBadges } from "./PaymentBadges";
import { CookieBanner } from "./CookieBanner";
import { COMPANY } from "@/lib/company";
import "./globals.css";

/**
 * Footer column. Each item is followed by a newline text node: invisible in the flex layout, but
 * it keeps the lines apart for crawlers and compliance scanners that read the raw text.
 */
function FooterColumn({ title, children }: { title: string; children: React.ReactNode[] }) {
  return (
    <div>
      <div className="text-xs uppercase text-zinc-500 mb-2 font-semibold">{title}</div>
      {"\n"}
      <div className="flex flex-col gap-1.5 text-sm text-zinc-400">
        {children.map((child, i) => (
          <Fragment key={i}>{child}{"\n"}</Fragment>
        ))}
      </div>
    </div>
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IRONMAX — Social Casino",
  description: "Play with points, no cash out. Just for fun.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
       <SessionProviderWrapper>
        <header className="relative border-b border-zinc-800 px-6 py-3 flex items-center justify-between bg-gradient-to-b from-zinc-900 to-zinc-950">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-9 h-9 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
            <span className="text-xl font-extrabold tracking-tight text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.5)]">
              IRONMAX
            </span>
          </Link>
          <HeaderNav />
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-800 bg-zinc-950 w-full">
          <div className="w-full px-6 sm:px-10 py-10 grid grid-cols-2 sm:grid-cols-5 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Logo className="w-7 h-7" />
                <span className="font-bold text-amber-400">IRONMAX</span>
              </div>
              {"\n"}
              <p className="text-xs text-zinc-500">
                Social casino for entertainment only. Points cost €1 per 100 and have no cash
                value — they cannot be withdrawn or exchanged for money.
              </p>
            </div>
            <FooterColumn title="Play">
              <Link href="/games" className="hover:text-amber-400">All games</Link>
              <Link href="/pricing" className="hover:text-amber-400">Points pricing</Link>
              <Link href="/register" className="hover:text-amber-400">Sign up</Link>
              <Link href="/account" className="hover:text-amber-400">My account</Link>
            </FooterColumn>
            <FooterColumn title="Help">
              <Link href="/faq" className="hover:text-amber-400">FAQ</Link>
              <Link href="/contact" className="hover:text-amber-400">Contact us</Link>
              <Link href="/responsible-gaming" className="hover:text-amber-400">Responsible Gaming</Link>
            </FooterColumn>
            <FooterColumn title="Legal">
              <Link href="/terms" className="hover:text-amber-400">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-amber-400">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-amber-400">Cookie Policy</Link>
              <Link href="/refund-policy" className="hover:text-amber-400">Refund Policy</Link>
              <Link href="/delivery-policy" className="hover:text-amber-400">Delivery Policy</Link>
            </FooterColumn>
            <FooterColumn title="Merchant details">
              <span>Legal name: {COMPANY.legalName}</span>
              <span>Registration No.: {COMPANY.registerCode}</span>
              <span>Address: {COMPANY.address}, Lithuania</span>
              <span>Email: <a href={`mailto:${COMPANY.email}`} className="hover:text-amber-400">{COMPANY.email}</a></span>
            </FooterColumn>
          </div>
          <div className="border-t border-zinc-900 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <PaymentBadges />
            {"\n"}
            <p className="text-xs text-zinc-500 text-center sm:text-right">
              The merchant, {COMPANY.legalName}, is located in the {COMPANY.country}. Prices are in
              euro (EUR).{" "}
              Card payments are secured with 3-D Secure.
              <br />
              {"\n"}
              © {new Date().getFullYear()} IRONMAX. For entertainment purposes only. 18+.
            </p>
          </div>
        </footer>
        <CookieBanner />
       </SessionProviderWrapper>
      </body>
    </html>
  );
}
