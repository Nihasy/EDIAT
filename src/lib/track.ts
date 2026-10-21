// Google Analytics 4 / Google Ads events. Does nothing until the Google tag is
// configured (NEXT_PUBLIC_GOOGLE_TAG_ID), so it is safe to call anywhere.
//
// NEXT_PUBLIC_GOOGLE_TAG_ID      "G-XXXXXXX" (GA4) or "AW-XXXXXXX" (Google Ads)
// NEXT_PUBLIC_GOOGLE_ADS_ID      "AW-XXXXXXX", when GA4 is the main tag
// NEXT_PUBLIC_GOOGLE_ADS_LEAD    "AW-XXXXXXX/label": conversion "demande envoyée"
// NEXT_PUBLIC_GOOGLE_ADS_CONTACT "AW-XXXXXXX/label": conversion "WhatsApp / appel"

type Gtag = (...args: unknown[]) => void;

function gtag(...args: unknown[]) {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof g === "function") g(...args);
}

export function trackLead(kind: string) {
  gtag("event", "generate_lead", { lead_kind: kind });
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD;
  if (label) gtag("event", "conversion", { send_to: label });
}

export function trackContact(method: "whatsapp" | "phone") {
  gtag("event", "contact", { method });
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONTACT;
  if (label) gtag("event", "conversion", { send_to: label });
}
