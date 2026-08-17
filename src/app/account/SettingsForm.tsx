"use client";
import { useState } from "react";

type Profile = { firstName: string; lastName: string; email: string };

export function SettingsForm({ profile }: { profile: Profile }) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName }),
    });
    setSavingProfile(false);
    setProfileMsg(res.ok ? { type: "ok", text: "Profile updated." } : { type: "error", text: "Could not save profile." });
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg(null);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const body = await res.json().catch(() => ({}));
    setSavingPassword(false);
    if (res.ok) {
      setPasswordMsg({ type: "ok", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setPasswordMsg({ type: "error", text: body.error ?? "Could not change password." });
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <form onSubmit={saveProfile} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="font-semibold mb-4">Profile</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-500">Email</label>
            <input disabled value={profile.email} className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 mt-1 text-zinc-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500">First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 mt-1" />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 mt-1" />
            </div>
          </div>
          <button disabled={savingProfile}
            className="self-start mt-1 rounded bg-amber-500 text-zinc-950 font-medium px-4 py-2 hover:bg-amber-400 disabled:opacity-50">
            {savingProfile ? "Saving…" : "Save profile"}
          </button>
          {profileMsg && <p className={`text-sm ${profileMsg.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>{profileMsg.text}</p>}
        </div>
      </form>

      <form onSubmit={savePassword} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="font-semibold mb-4">Change password</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-500">Current password</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-xs text-zinc-500">New password (min 8 chars)</label>
            <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 mt-1" />
          </div>
          <button disabled={savingPassword}
            className="self-start mt-1 rounded bg-amber-500 text-zinc-950 font-medium px-4 py-2 hover:bg-amber-400 disabled:opacity-50">
            {savingPassword ? "Updating…" : "Update password"}
          </button>
          {passwordMsg && <p className={`text-sm ${passwordMsg.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>{passwordMsg.text}</p>}
        </div>
      </form>
    </div>
  );
}
