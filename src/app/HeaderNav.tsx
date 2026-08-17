"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function HeaderNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const loggedIn = !!session?.user;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const links = (
    <>
      <Link href="/games" className="hover:text-amber-400" onClick={() => setOpen(false)}>Games</Link>
      {loggedIn ? (
        <>
          {isAdmin && <Link href="/admin" className="hover:text-amber-400" onClick={() => setOpen(false)}>Admin</Link>}
          <Link href="/account" className="hover:text-amber-400" onClick={() => setOpen(false)}>Account</Link>
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
            className="text-zinc-400 hover:text-white text-left"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="hover:text-amber-400" onClick={() => setOpen(false)}>Log in</Link>
          <Link href="/register" onClick={() => setOpen(false)} className="rounded bg-amber-500 px-3 py-1.5 text-zinc-950 font-medium hover:bg-amber-400 text-center">
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="hidden sm:flex items-center gap-4 text-sm">{links}</nav>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        className="sm:hidden flex flex-col gap-1.5 p-2 -mr-2"
      >
        <span className={`block w-6 h-0.5 bg-zinc-200 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block w-6 h-0.5 bg-zinc-200 transition-opacity ${open ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-0.5 bg-zinc-200 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>
      {open && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex flex-col gap-4 text-sm z-50">
          {links}
        </div>
      )}
    </>
  );
}
