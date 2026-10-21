import type { MetadataRoute } from "next";
import { publicVehicles } from "@/lib/catalog";
import { catalogHref } from "@/lib/catalog-filter";
import { siteUrl } from "@/lib/site";
import { STATUSES, vehicleHref } from "@/lib/vehicle";

// Same one-day delay as the catalogue snapshot (lib/catalog).
export const revalidate = 86400;

// Every page Google should know: main pages, the brand / body-type / availability
// lists that have vehicles, and each vehicle still on sale (with its photos).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const all = await publicVehicles();
  const onSale = all.filter((v) => v.status !== "vendu");
  const latest = onSale.reduce((d, v) => (v.updatedAt > d ? v.updatedAt : d), "") || undefined;

  const pages = ["", "/voitures", "/sur-commande", "/financement", "/contact"].map((p) => ({
    url: `${base}${p}`,
    lastModified: p === "" || p === "/voitures" ? latest : undefined,
    changeFrequency: p === "" || p === "/voitures" ? ("daily" as const) : ("monthly" as const),
    priority: p === "" ? 1 : p === "/voitures" ? 0.9 : 0.6,
  }));
  const listed = onSale.filter((v) => STATUSES[v.status].listed);
  const lists = [
    ...new Set(listed.map((v) => catalogHref({ marque: v.brand }))),
    ...new Set(listed.filter((v) => v.body).map((v) => catalogHref({ carrosserie: v.body }))),
    ...new Set(listed.map((v) => catalogHref({ dispo: v.status }))),
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  const vehicles = onSale.map((v) => ({
    url: `${base}${vehicleHref(v)}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: v.images.slice(0, 5),
  }));
  return [...pages, ...lists, ...vehicles];
}
