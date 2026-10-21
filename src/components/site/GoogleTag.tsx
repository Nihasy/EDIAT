"use client";

import Script from "next/script";
import { useEffect } from "react";
import { trackContact } from "@/lib/track";

const TAG = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
const ADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

// Google tag (GA4 and/or Google Ads), only when an id is configured.
// WhatsApp and phone links anywhere on the site count as "contact" conversions.
export function GoogleTag() {
  useEffect(() => {
    if (!TAG) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const href = a?.getAttribute("href") ?? "";
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) trackContact("whatsapp");
      else if (href.startsWith("tel:")) trackContact("phone");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!TAG) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${TAG}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(TAG)});${ADS && ADS !== TAG ? `gtag('config',${JSON.stringify(ADS)});` : ""}`}
      </Script>
    </>
  );
}
