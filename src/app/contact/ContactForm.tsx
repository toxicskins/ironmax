"use client";
import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });
    if (res.ok) {
      setStatus("sent");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-6 text-center">
        <p className="text-emerald-400 font-semibold">Message sent — we'll get back to you by email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-500">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 mt-1" />
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-500">Subject</label>
        <input required value={subject} onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 mt-1" />
      </div>
      <div>
        <label className="text-xs text-zinc-500">Message</label>
        <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 mt-1 resize-none" />
      </div>
      <button disabled={status === "sending"}
        className="self-start rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 font-bold px-6 py-2.5 shadow-[0_0_25px_-4px_rgba(245,158,11,0.8)] hover:brightness-110 transition disabled:opacity-50">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {status === "error" && <p className="text-red-400 text-sm">Something went wrong — try again.</p>}
    </form>
  );
}
