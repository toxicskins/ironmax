"use client";
import { useEffect, useState } from "react";

type PaymentMethod = {
  id: string;
  name: string;
  imageUrl: string;
  paynetApiUrl: string;
  paynetLogin: string;
  paynetEndpointId: string;
  active: boolean;
  sortOrder: number;
  configured: boolean;
  paynetSigningKey?: string;
};

const EMPTY_METHOD: PaymentMethod = {
  id: "",
  name: "",
  imageUrl: "",
  paynetApiUrl: "",
  paynetLogin: "",
  paynetEndpointId: "",
  active: true,
  sortOrder: 0,
  configured: false,
  paynetSigningKey: "",
};

export function PaymentMethodsForm() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [draft, setDraft] = useState<PaymentMethod>(EMPTY_METHOD);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadMethods() {
    const data = await fetch("/api/admin/payment-methods").then((r) => r.json());
    setMethods(data);
  }

  useEffect(() => {
    fetch("/api/admin/payment-methods").then((r) => r.json()).then(setMethods);
  }, []);

  function updateMethod<K extends keyof PaymentMethod>(id: string, key: K, value: PaymentMethod[K]) {
    setMethods((items) => items.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  }

  async function saveMethod(method: PaymentMethod) {
    setSavingId(method.id);
    setError(null);
    const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: method.name,
        imageUrl: method.imageUrl,
        paynetApiUrl: method.paynetApiUrl,
        paynetLogin: method.paynetLogin,
        paynetEndpointId: method.paynetEndpointId,
        paynetSigningKey: method.paynetSigningKey ?? "",
        active: method.active,
        sortOrder: method.sortOrder,
      }),
    });
    setSavingId(null);
    if (!res.ok) {
      setError("Could not save payment method.");
      return;
    }
    await loadMethods();
  }

  async function addMethod() {
    setSavingId("new");
    setError(null);
    const res = await fetch("/api/admin/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSavingId(null);
    if (!res.ok) {
      setError("Could not add payment method.");
      return;
    }
    setDraft(EMPTY_METHOD);
    await loadMethods();
  }

  async function deleteMethod(id: string) {
    setSavingId(id);
    setError(null);
    const res = await fetch(`/api/admin/payment-methods/${id}`, { method: "DELETE" });
    setSavingId(null);
    if (!res.ok) {
      setError("Could not delete payment method.");
      return;
    }
    await loadMethods();
  }

  return (
    <div className="rounded-lg border border-zinc-800 p-4">
      <p className="text-xs text-zinc-500 mb-4">
        Each checkout option is processed by PayNet Easy, but can use its own merchant credentials, display name, and image.
      </p>

      <div className="space-y-4">
        {methods.map((method) => (
          <div key={method.id} className="rounded border border-zinc-800 bg-zinc-950 p-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Checkout name" value={method.name} onChange={(e) => updateMethod(method.id, "name", e.target.value)}
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
              <input type="number" placeholder="Sort" value={method.sortOrder} onChange={(e) => updateMethod(method.id, "sortOrder", Number(e.target.value))}
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
              <input placeholder="Image URL" value={method.imageUrl} onChange={(e) => updateMethod(method.id, "imageUrl", e.target.value)}
                className="col-span-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
              <input placeholder="PayNetEasy API v2 URL" value={method.paynetApiUrl} onChange={(e) => updateMethod(method.id, "paynetApiUrl", e.target.value)}
                className="col-span-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
              <input placeholder="Login" value={method.paynetLogin} onChange={(e) => updateMethod(method.id, "paynetLogin", e.target.value)}
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
              <input placeholder="EndpointGroupID" value={method.paynetEndpointId} onChange={(e) => updateMethod(method.id, "paynetEndpointId", e.target.value)}
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
              <input type="password" placeholder={method.configured ? "New control key (leave blank to keep current)" : "Control key"}
                value={method.paynetSigningKey ?? ""} onChange={(e) => updateMethod(method.id, "paynetSigningKey", e.target.value)}
                className="col-span-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input type="checkbox" checked={method.active} onChange={(e) => updateMethod(method.id, "active", e.target.checked)}
                  className="w-4 h-4 accent-amber-500" />
                Active
              </label>
              <button onClick={() => saveMethod(method)} disabled={savingId === method.id}
                className="rounded bg-amber-500 text-zinc-950 font-medium px-4 py-1.5 hover:bg-amber-400 disabled:opacity-50">
                {savingId === method.id ? "Saving..." : "Save"}
              </button>
              <button onClick={() => deleteMethod(method.id)} disabled={savingId === method.id}
                className="rounded border border-red-500/40 text-red-300 px-4 py-1.5 text-sm hover:bg-red-500/10 disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        ))}

        {methods.length === 0 && <div className="text-sm text-zinc-500">No payment methods configured yet.</div>}
      </div>

      <div className="mt-5 border-t border-zinc-800 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Add payment method</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Checkout name" value={draft.name} onChange={(e) => setDraft((m) => ({ ...m, name: e.target.value }))}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input type="number" placeholder="Sort" value={draft.sortOrder} onChange={(e) => setDraft((m) => ({ ...m, sortOrder: Number(e.target.value) }))}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input placeholder="Image URL" value={draft.imageUrl} onChange={(e) => setDraft((m) => ({ ...m, imageUrl: e.target.value }))}
            className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input placeholder="PayNetEasy API v2 URL" value={draft.paynetApiUrl} onChange={(e) => setDraft((m) => ({ ...m, paynetApiUrl: e.target.value }))}
            className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input placeholder="Login" value={draft.paynetLogin} onChange={(e) => setDraft((m) => ({ ...m, paynetLogin: e.target.value }))}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input placeholder="EndpointGroupID" value={draft.paynetEndpointId} onChange={(e) => setDraft((m) => ({ ...m, paynetEndpointId: e.target.value }))}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          <input type="password" placeholder="Control key" value={draft.paynetSigningKey ?? ""} onChange={(e) => setDraft((m) => ({ ...m, paynetSigningKey: e.target.value }))}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={addMethod} disabled={savingId === "new"}
            className="rounded bg-amber-500 text-zinc-950 font-medium px-4 py-1.5 hover:bg-amber-400 disabled:opacity-50">
            {savingId === "new" ? "Adding..." : "Add method"}
          </button>
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      </div>
    </div>
  );
}
