import crypto from "crypto";

const PAYNET_API_URL = process.env.PAYNET_API_URL ?? "https://gate.payneteasy.eu/paynet/api/v2";
const PAYNET_SIGNING_KEY = process.env.PAYNET_SIGNING_KEY ?? "";

type PaynetCredentials = {
  paynetApiUrl?: string | null;
  paynetLogin?: string | null;
  paynetEndpointId: string;
  paynetSigningKey: string;
};

type PaynetBilling = {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

const COUNTRY_CODES: Record<string, string> = {
  Austria: "AT",
  Belgium: "BE",
  Bulgaria: "BG",
  Croatia: "HR",
  Cyprus: "CY",
  Czechia: "CZ",
  Denmark: "DK",
  Estonia: "EE",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  Greece: "GR",
  Hungary: "HU",
  Ireland: "IE",
  Italy: "IT",
  Latvia: "LV",
  Lithuania: "LT",
  Luxembourg: "LU",
  Malta: "MT",
  Netherlands: "NL",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  Slovakia: "SK",
  Slovenia: "SI",
  Spain: "ES",
  Sweden: "SE",
  "United Kingdom": "GB",
  "United States": "US",
  Canada: "CA",
  Australia: "AU",
  Switzerland: "CH",
  Norway: "NO",
  Ukraine: "UA",
  Turkey: "TR",
  Brazil: "BR",
  Mexico: "MX",
  Japan: "JP",
  "South Korea": "KR",
  India: "IN",
};

function sha1(payload: string) {
  return crypto.createHash("sha1").update(payload).digest("hex");
}

function normalizeBaseUrl(apiUrl?: string | null) {
  return (apiUrl?.trim() || PAYNET_API_URL).replace(/\/+$/, "");
}

function callbackUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  return appUrl ? `${appUrl}/api/webhooks/paynet` : undefined;
}

function countryCode(country: string) {
  return COUNTRY_CODES[country] ?? country.slice(0, 2).toUpperCase();
}

function phone(value: string) {
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned.slice(0, 15);
}

function parseFormResponse(text: string) {
  return new URLSearchParams(text.replace(/\n/g, "&"));
}

export async function createPaynetPayment(opts: {
  orderId: string;
  amountEur: number;
  customerEmail: string;
  returnUrl: string;
  ipAddress: string;
  billing?: PaynetBilling;
  credentials: PaynetCredentials;
}) {
  const endpointGroupId = opts.credentials.paynetEndpointId;
  const amount = opts.amountEur.toFixed(2);
  const amountMinor = Math.round(opts.amountEur * 100).toString();
  const control = sha1(`${endpointGroupId}${opts.orderId}${amountMinor}${opts.customerEmail}${opts.credentials.paynetSigningKey}`);
  const billing = opts.billing;

  const body = new URLSearchParams({
    client_orderid: opts.orderId,
    order_desc: `IRONMAX points purchase ${opts.orderId}`,
    first_name: billing?.firstName || "Customer",
    last_name: billing?.lastName || "Customer",
    address1: billing?.street || "N/A",
    city: billing?.city || "N/A",
    zip_code: billing?.postalCode || "00000",
    country: billing ? countryCode(billing.country) : "LT",
    phone: billing ? phone(billing.phone) : "+37000000000",
    amount,
    email: opts.customerEmail,
    currency: "EUR",
    ipaddress: opts.ipAddress,
    site_url: process.env.NEXT_PUBLIC_APP_URL ?? opts.returnUrl,
    purpose: opts.customerEmail,
    redirect_url: opts.returnUrl,
    ...(callbackUrl() ? { server_callback_url: callbackUrl()! } : {}),
    merchant_data: opts.orderId,
    control,
  });

  if (opts.credentials.paynetLogin?.trim()) body.set("login", opts.credentials.paynetLogin.trim());

  const url = `${normalizeBaseUrl(opts.credentials.paynetApiUrl)}/sale-form/group/${encodeURIComponent(endpointGroupId)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PayNet Easy error: ${res.status} ${text}`);

  const data = parseFormResponse(text);
  const type = data.get("type");
  const paymentUrl = data.get("redirect-url");
  if (!paymentUrl) {
    throw new Error(data.get("error-message") ?? `PayNet Easy did not return redirect-url (${type ?? "unknown response"})`);
  }

  return {
    payment_url: paymentUrl,
    payment_id: data.get("paynet-order-id") ?? opts.orderId,
  };
}

/** Verifies the SHA-1 control value PayNetEasy sends on callbacks/final redirects. */
export function verifyPaynetWebhook(params: URLSearchParams, signingKey = PAYNET_SIGNING_KEY) {
  const control = params.get("control");
  const status = params.get("status");
  const orderId = params.get("orderid");
  const merchantOrder = params.get("merchant_order") ?? params.get("client_orderid");
  if (!control || !status || !orderId || !merchantOrder) return false;

  const expected = sha1(`${status}${orderId}${merchantOrder}${signingKey}`);
  const expectedBuffer = Buffer.from(expected);
  const controlBuffer = Buffer.from(control);
  if (expectedBuffer.length !== controlBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, controlBuffer);
}
