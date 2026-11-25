"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { COOKIE_CHOICE_NAME } from "@/lib/company";

function readChoice() {
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_CHOICE_NAME}=`));
}

// document.cookie has no change event; the choice only changes through this component.
const subscribe = () => () => {};

function saveChoice(value: "necessary" | "all") {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_CHOICE_NAME}=${value}; Max-Age=${oneYear}; Path=/; SameSite=Lax`;
}

/**
 * IRONMAX only sets strictly necessary cookies, so both buttons lead to the same cookies today.
 * The banner still records an explicit choice so any future optional cookies have a consent gate.
 */
export function CookieBanner() {
  // Server render and hydration assume a choice exists, so the banner only appears on the client.
  const hasChoice = useSyncExternalStore(subscribe, readChoice, () => true);
  const [dismissed, setDismissed] = useState(false);

  if (hasChoice || dismissed) return null;

  function choose(value: "necessary" | "all") {
    saveChoice(value);
    setDismissed(true);
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-zinc-700 bg-zinc-900/95 backdrop-blur px-4 py-4 sm:px-8"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <p className="text-sm text-zinc-300 leading-relaxed">
          We use only strictly necessary cookies to keep you signed in, protect forms against
          forgery and remember this choice. We do not use advertising or tracking cookies. See our{" "}
          <Link href="/cookies" className="text-amber-400 hover:underline">Cookie Policy</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("necessary")}
            className="rounded border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-400"
          >
            Necessary only
          </button>
          <button
            onClick={() => choose("all")}
            className="rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
