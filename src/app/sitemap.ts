import type { MetadataRoute } from "next";
import { publicVehicles } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";
import { vehicleHref } from "@/lib/vehicle";

// Same one-day delay as the catalogue snapshot (lib/catalog).
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ["", "/voitures", "/sur-commande", "/financement", "/contact"].map((p) => ({ url: `${base}${p}` }));
  const vehicles = (await publicVehicles()).map((v) => ({ url: `${base}${vehicleHref(v)}`, lastModified: v.updatedAt }));
  return [...pages, ...vehicles];
}
