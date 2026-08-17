"use client";
import { useEffect, useState } from "react";

type Settings = { smtpHost: string; smtpPort: number; smtpUser: string; fromEmail: string; fromName: string; configured: boolean };

export function MailSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [smtpPass, setSmtpPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/mail-settings").then((r) => r.json()).then(setSettings);
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
    setSaved(false);
  }

  async function onSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/mail-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpPass,
        fromEmail: settings.fromEmail,
        fromName: settings.fromName,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setSmtpPass("");
      const fresh = await fetch("/api/admin/mail-settings").then((r) => r.json());
      setSettings(fresh);
    }
  }

  if (!settings) return <div className="text-sm text-zinc-500">Loading…</div>;

  return (
    <div className="rounded-lg border border-zinc-800 p-4 max-w-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-500">
          Used to send password-reset links and order-confirmation emails (with invoice attached).
        </p>
        <span className={`shrink-0 ml-3 text-xs font-semibold px-2 py-0.5 rounded-full ${settings.configured ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
          {settings.configured ? "Connected" : "Not configured"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="SMTP host" value={settings.smtpHost} onChange={(e) => update("smtpHost", e.target.value)}
          className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input type="number" placeholder="Port" value={settings.smtpPort} onChange={(e) => update("smtpPort", Number(e.target.value))}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input placeholder="SMTP username" value={settings.smtpUser} onChange={(e) => update("smtpUser", e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input type="password" placeholder={settings.configured ? "New SMTP password (leave blank to keep current)" : "SMTP password"}
          value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)}
          className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input type="email" placeholder="From email" value={settings.fromEmail} onChange={(e) => update("fromEmail", e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        <input placeholder="From name (optional)" value={settings.fromName} onChange={(e) => update("fromName", e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button onClick={onSave} disabled={saving}
          className="rounded bg-amber-500 text-zinc-950 font-medium px-4 py-1.5 hover:bg-amber-400 disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs text-emerald-400">Saved.</span>}
      </div>
    </div>
  );
}
