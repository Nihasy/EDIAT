// Catalogue filters, shared by the server (results) and the browser (the
// filter panel counts results live before applying). Everything lives in the
// URL, so a shared link restores the same list.

import { fold } from "./format";
import { isStatus, STATUSES, type Vehicle } from "./vehicle";

export const FILTER_KEYS = [
  "q", "dispo", "marque", "carrosserie", "carburant", "boite",
  "prix_min", "prix_max", "annee_min", "annee_max", "km_max", "tri", "ordre", "page",
] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Partial<Record<FilterKey, string>>;

// Old sort links ("prix_asc"…) keep working.
const LEGACY_SORT: Record<string, [string, string]> = {
  prix_asc: ["prix", "asc"],
  prix_desc: ["prix", "desc"],
  km_asc: ["km", "asc"],
  annee_desc: ["annee", "desc"],
};

export function readFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const out: Filters = {};
  for (const k of FILTER_KEYS) {
    const v = sp[k];
    const s = (Array.isArray(v) ? v[0] : v)?.trim().slice(0, k === "marque" ? 400 : 80);
    if (s) out[k] = s;
  }
  const legacy = out.tri && LEGACY_SORT[out.tri];
  if (legacy) [out.tri, out.ordre] = legacy;
  return out;
}

/** "Kia,Hyundai" → ["Kia", "Hyundai"]. */
export const list = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export const num = (v?: string | number) => {
  const n = typeof v === "number" ? v : Number(v?.replace(/\s/g, ""));
  return v !== undefined && v !== "" && Number.isFinite(n) && n > 0 ? n : undefined;
};

/** What the filter panel needs to count results in the browser. */
export type Filterable = Pick<Vehicle, "id" | "status" | "brand" | "body" | "fuel" | "gearbox" | "price" | "year" | "mileageKm">;

export const toFilterable = (v: Filterable): Filterable => ({
  id: v.id, status: v.status, brand: v.brand, body: v.body, fuel: v.fuel, gearbox: v.gearbox,
  price: v.price, year: v.year, mileageKm: v.mileageKm,
});

export type Facet = "dispo" | "marque" | "carrosserie" | "carburant" | "boite";

/** Every filter except the text search (applied beforehand). `skip` leaves one out, to count its options. */
export function matchFilters(v: Filterable, f: Filters, skip?: Facet): boolean {
  if (!STATUSES[v.status].listed) return false;
  if (skip !== "dispo" && isStatus(f.dispo) && v.status !== f.dispo) return false;
  const brands = list(f.marque).map(fold);
  if (skip !== "marque" && brands.length && !brands.includes(fold(v.brand))) return false;
  const bodies = list(f.carrosserie);
  if (skip !== "carrosserie" && bodies.length && !bodies.includes(v.body)) return false;
  const fuels = list(f.carburant);
  if (skip !== "carburant" && fuels.length && !fuels.includes(v.fuel)) return false;
  const boxes = list(f.boite);
  if (skip !== "boite" && boxes.length && !boxes.includes(v.gearbox)) return false;
  const pmin = num(f.prix_min), pmax = num(f.prix_max);
  if ((pmin || pmax) && v.price == null) return false;
  if (pmin && v.price! < pmin) return false;
  if (pmax && v.price! > pmax) return false;
  const ymin = num(f.annee_min), ymax = num(f.annee_max);
  if ((ymin || ymax) && v.year == null) return false;
  if (ymin && v.year! < ymin) return false;
  if (ymax && v.year! > ymax) return false;
  const km = num(f.km_max);
  if (km && (v.mileageKm == null || v.mileageKm > km)) return false;
  return true;
}

/** Filters set in the panel (not the quick bar, the search or the sort). */
export function panelFilterCount(f: Filters) {
  return (
    (f.prix_min || f.prix_max ? 1 : 0) +
    (f.marque ? 1 : 0) +
    (f.annee_min || f.annee_max ? 1 : 0) +
    (f.km_max ? 1 : 0) +
    (f.carburant ? 1 : 0) +
    (f.boite ? 1 : 0)
  );
}

// Sort criteria; each has the direction a buyer expects first.
export const SORTS: { id: string; label: string; dir?: "asc" | "desc" }[] = [
  { id: "", label: "Disponibilité" },
  { id: "pertinence", label: "Pertinence" },
  { id: "recent", label: "Nouveautés", dir: "desc" },
  { id: "prix", label: "Prix", dir: "asc" },
  { id: "km", label: "Kilométrage", dir: "asc" },
  { id: "annee", label: "Année", dir: "desc" },
];

/** Builds a catalogue link from the current filters and some changes ("" removes a key). */
export function catalogHref(current: Filters, changes: Filters = {}) {
  const next = new URLSearchParams();
  const merged = { ...current, ...changes };
  if (!("page" in changes)) delete merged.page;
  for (const k of FILTER_KEYS) if (merged[k]) next.set(k, merged[k]!);
  const s = next.toString();
  return `/voitures${s ? `?${s}` : ""}`;
}
