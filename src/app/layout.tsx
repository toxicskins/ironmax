import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Logo } from "./Logo";
import { HeaderNav } from "./HeaderNav";
import { SessionProviderWrapper } from "./SessionProviderWrapper";
import "./globals.css";

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
              <p className="text-xs text-zinc-500">Social casino. Points are for fun only — no cash value, no withdrawals.</p>
            </div>
            <div>
              <div className="text-xs uppercase text-zinc-500 mb-2 font-semibold">Play</div>
              <div className="flex flex-col gap-1.5 text-sm text-zinc-400">
                <Link href="/games" className="hover:text-amber-400">All games</Link>
                <Link href="/register" className="hover:text-amber-400">Sign up</Link>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-zinc-500 mb-2 font-semibold">Account</div>
              <div className="flex flex-col gap-1.5 text-sm text-zinc-400">
                <Link href="/account" className="hover:text-amber-400">My account</Link>
                <Link href="/login" className="hover:text-amber-400">Log in</Link>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-zinc-500 mb-2 font-semibold">Legal</div>
              <div className="flex flex-col gap-1.5 text-sm text-zinc-400">
                <Link href="/terms" className="hover:text-amber-400">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-amber-400">Privacy Policy</Link>
                <Link href="/responsible-gaming" className="hover:text-amber-400">Responsible Gaming</Link>
                <Link href="/contact" className="hover:text-amber-400">Contact</Link>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-zinc-500 mb-2 font-semibold">Company</div>
              <div className="flex flex-col gap-1.5 text-sm text-zinc-400">
                <span>Legal name: Ironmax Lithuania, UAB</span>
                <span>Registration No.: 306209351</span>
                <span>Address: Girulių g. 10-201, LT-12112 Vilnius</span>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-900 px-6 sm:px-10 py-4 text-xs text-zinc-500 text-center">
            © {new Date().getFullYear()} IRONMAX. For entertainment purposes only. 18+.
          </div>
        </footer>
       </SessionProviderWrapper>
      </body>
    </html>
  );
}
