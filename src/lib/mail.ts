import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function getMailSettings() {
  return prisma.mailSettings.findUnique({ where: { id: "singleton" } });
}

export async function isMailConfigured() {
  const s = await getMailSettings();
  return !!(s?.smtpHost && s.smtpPort && s.smtpUser && s.smtpPass && s.fromEmail);
}

/** Sends via the SMTP connection configured in the admin panel. No-ops (logs only) when mail
 * isn't configured yet, so password-reset/order flows never crash a demo deployment that hasn't
 * wired up a real mailbox. */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const settings = await getMailSettings();
  if (!settings?.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass || !settings.fromEmail) {
    console.warn(`[mail] Not configured — skipped "${opts.subject}" to ${opts.to}`);
    return { sent: false as const };
  }

  const transport = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465,
    auth: { user: settings.smtpUser, pass: settings.smtpPass },
  });

  await transport.sendMail({
    from: settings.fromName ? `"${settings.fromName}" <${settings.fromEmail}>` : settings.fromEmail,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments,
  });
  return { sent: true as const };
}
