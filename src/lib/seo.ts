import type { Metadata } from "next";
import type { Settings } from "./settings-shared";
import { siteUrl } from "./site";

export const HOME_TITLE = "Ediat Garage — Voitures d'occasion à Antananarivo";
export const SITE_DESCRIPTION =
  "Voitures d'occasion à Antananarivo : SUV, 4x4, berlines et utilitaires disponibles au showroom, en arrivage ou importés sur commande. Paiement échelonné avec Ediat Facility, en partenariat avec la PAMF.";

// One place for the search / share tags of a page: title, description,
// canonical address, and the same text in link previews (WhatsApp, Facebook).
export function pageMeta({ title, description, path, images }: { title: string; description: string; path: string; images?: string[] }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, ...(images?.length ? { images } : {}) },
    twitter: { title, description },
  };
}

// The garage as Google sees it (knowledge panel, local results).
export function dealerJsonLd(s: Settings) {
  const base = siteUrl();
  const sameAs = [s.facebookUrl, s.instagramUrl, s.tiktokUrl].filter((u) => u && u !== "https://www.facebook.com/");
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${base}/#garage`,
    name: "Ediat Garage",
    url: base,
    logo: `${base}/brand/ediat-logo-lg.webp`,
    image: `${base}/opengraph-image.png`,
    description: "Voitures d'occasion à Antananarivo : disponibles au showroom, en arrivage ou importées sur commande.",
    telephone: `+${s.phone}`,
    ...(s.email ? { email: s.email } : {}),
    address: { "@type": "PostalAddress", streetAddress: s.address.split("\n")[0], addressLocality: "Antananarivo", addressCountry: "MG" },
    areaServed: { "@type": "Country", name: "Madagascar" },
    currenciesAccepted: "MGA",
    ...(s.mapsUrl ? { hasMap: s.mapsUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  const base = siteUrl();
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${base}/#site`, name: "Ediat Garage", url: base, inLanguage: "fr", publisher: { "@id": `${base}/#garage` } };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${base}${it.path}` })),
  };
}

// Safe inline JSON-LD (no "</script>" break-out).
export const ldJson = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
