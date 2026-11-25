/** Merchant/DBA details shown on invoices, the footer, and contact/policy pages. */
export const COMPANY = {
  legalName: "Ironmax Lithuania, UAB",
  dba: "IRONMAX",
  registerCode: "306209351",
  address: "Girulių g. 10-201, LT-12112 Vilnius",
  country: "Republic of Lithuania",
  email: "info@ironmaxedu.com",
  supportHours: "Mon–Fri, 9:00–18:00 (UTC)",
};

/** Single "last updated" date shared by every legal page — bump it whenever a policy changes. */
export const LEGAL_UPDATED = "25 November 2026";

/** Points pricing, shared by the public pricing page, FAQ and policies. Mirrors /api/deposit. */
export const PRICING = {
  currency: "EUR",
  pointsPerEur: 100,
  minEur: 1,
  maxEur: 1000,
  packages: [5, 10, 25, 50, 100, 250],
};

/** Cookie that records the visitor's cookie-banner choice; listed in the Cookie Policy table. */
export const COOKIE_CHOICE_NAME = "ironmax_cookie_choice";

/** Sanctioned / restricted territories; kept in one place so the Terms and FAQ agree. */
export const PROHIBITED_COUNTRIES = [
  "Russia",
  "Belarus",
  "Iran",
  "North Korea",
  "Syria",
  "Cuba",
  "the Crimea, Donetsk, Luhansk, Zaporizhzhia and Kherson regions of Ukraine under occupation",
];
