import Link from "next/link";
import { handlePaynetCallback } from "@/lib/paynet-callback";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toParams(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else if (value) {
      params.set(key, value);
    }
  }
  return params;
}

function statusCopy(status?: string) {
  if (status === "COMPLETED") {
    return {
      title: "Payment complete",
      tone: "text-emerald-400",
      body: "Your points have been credited. The invoice is available in your account orders.",
    };
  }

  if (status === "FAILED") {
    return {
      title: "Payment was not completed",
      tone: "text-red-400",
      body: "The payment provider did not approve this payment. You can try again from your account.",
    };
  }

  return {
    title: "Payment is processing",
    tone: "text-amber-400",
    body: "We are waiting for the final confirmation from PayNet Easy. This page can be refreshed in a few moments.",
  };
}

export default async function PaymentStatusPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const params = toParams(resolvedParams);

  const callbackResult = await handlePaynetCallback(params);
  const orderId = callbackResult.transactionId
    ?? first(resolvedParams.order)
    ?? first(resolvedParams.merchant_order)
    ?? first(resolvedParams.client_orderid);

  const transaction = orderId
    ? await prisma.transaction.findUnique({
        where: { id: orderId },
        include: { invoice: true },
      })
    : null;

  const copy = statusCopy(transaction?.status);
  const invalidSignature = callbackResult.found && !callbackResult.verified && !!params.get("control");

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Payment status</div>
        <h1 className={`text-2xl font-bold mb-3 ${invalidSignature ? "text-red-400" : copy.tone}`}>
          {invalidSignature ? "Payment status could not be verified" : copy.title}
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          {invalidSignature
            ? "The payment provider returned a status, but the signature did not match. Please contact support before trying again."
            : copy.body}
        </p>

        {transaction ? (
          <div className="rounded border border-zinc-800 bg-zinc-950 p-4 text-sm space-y-3">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Order</span>
              <span className="text-zinc-200 text-right break-all">{transaction.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Status</span>
              <span className={copy.tone}>{transaction.status}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Points</span>
              <span className="text-zinc-200">{transaction.coinsDelta.toLocaleString("en-US")}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Amount</span>
              <span className="text-zinc-200">€{Number(transaction.eurAmount ?? 0).toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            We could not find this payment order.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Link href="/account" className="rounded bg-amber-500 text-zinc-950 font-semibold px-4 py-2 hover:bg-amber-400">
            Back to account
          </Link>
          {transaction?.invoice && (
            <a href={`/api/invoices/${transaction.invoice.id}`} className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-amber-500">
              Download invoice
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
