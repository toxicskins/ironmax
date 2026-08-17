import { prisma } from "@/lib/prisma";
import { renderInvoicePdf } from "@/lib/invoice";
import { sendMail } from "@/lib/mail";

/** Credits the wallet, generates the invoice, and emails it — shared by the PayNet webhook
 * and the admin panel's manual "mark as completed" action so both paths behave identically. */
export async function completeDeposit(transactionId: string) {
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { user: true } });
  if (!tx || tx.status === "COMPLETED") return;

  const invoiceNumber = `INV-${tx.createdAt.getFullYear()}-${tx.id.slice(0, 8).toUpperCase()}`;
  const pdfBuffer = await renderInvoicePdf({
    invoiceNumber,
    orderId: tx.id,
    orderDate: tx.createdAt,
    transactionDate: new Date(),
    customerEmail: tx.user.email,
    buyerName: tx.billingName ?? `${tx.user.firstName ?? ""} ${tx.user.lastName ?? ""}`.trim(),
    buyerPhone: tx.billingPhone ?? "",
    buyerAddress: tx.billingAddress ?? tx.user.billingAddress ?? "",
    eurAmount: Number(tx.eurAmount ?? 0),
    coins: tx.coinsDelta,
  });

  await prisma.$transaction(async (db) => {
    await db.transaction.update({ where: { id: tx.id }, data: { status: "COMPLETED" } });
    await db.wallet.update({ where: { userId: tx.userId }, data: { coins: { increment: tx.coinsDelta } } });
    await db.invoice.create({
      data: {
        transactionId: tx.id, userId: tx.userId, number: invoiceNumber,
        pdfData: new Uint8Array(pdfBuffer),
      },
    });
  });

  await sendMail({
    to: tx.user.email,
    subject: `Your IRONMAX order ${invoiceNumber} is complete`,
    html: `
      <p>Thanks for topping up! Your order is complete.</p>
      <p><strong>${tx.coinsDelta.toLocaleString("en-US")} points</strong> credited to your account for €${Number(tx.eurAmount ?? 0).toFixed(2)}.</p>
      <p>Your invoice is attached to this email, and always available from your account under Orders.</p>
    `,
    attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer }],
  });
}
