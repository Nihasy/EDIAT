import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { queryStatic } from "./db";
import { fold } from "./format";
import { parseSettings } from "./settings-shared";
import { isStatus, PUBLIC_DISPO, STATUSES, vehicleFullTitle, type Vehicle, type VehicleStatus } from "./vehicle";
import { toVehicle } from "./vehicles";

// Everything the public site shows comes from this snapshot, kept in the
// Next.js cache: visitors and crawlers do not wake the database. It is read
// again at most once an hour, and at once after any back-office change
// (refreshSite in admin/actions clears SITE_TAG).
export const SITE_TAG = "site";
const snapshot = { tags: [SITE_TAG], revalidate: 3600 };

// Private columns (cost, notes) are never selected for the public site.
const PUBLIC_COLUMNS = `id, ref, status, brand, model, version, year, mileage_km, fuel, gearbox, body, drive, engine,
  power_hp, seats, doors, color, origin, price, old_price, monthly_override, financing, eta, featured,
  description, equipment, images, created_at, updated_at, published_at`;

const readVehicles = unstable_cache(
  async () => queryStatic(`SELECT ${PUBLIC_COLUMNS} FROM vehicles WHERE status <> 'brouillon'`),
  ["site-vehicles"],
  snapshot,
);

const readSettings = unstable_cache(
  async () => ((await queryStatic(`SELECT value FROM settings WHERE key = 'main'`))[0]?.value as string | undefined) ?? null,
  ["site-settings"],
  snapshot,
);

export const siteSettings = cache(async () => parseSettings(await readSettings()));

// Showroom first, then arriving, on order, reserved, sold; newest first inside.
export const publicVehicles = cache(async (): Promise<Vehicle[]> => {
  const list = (await readVehicles()).map(toVehicle).filter((v) => STATUSES[v.status].isPublic);
  return list.sort(
    (a, b) =>
      STATUSES[a.status].rank - STATUSES[b.status].rank ||
      Number(b.featured) - Number(a.featured) ||
      (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt),
  );
});

export async function publicVehicle(id: number) {
  return (await publicVehicles()).find((v) => v.id === id) ?? null;
}

export const SORTS = [
  { id: "", label: "Disponibilité" },
  { id: "recent", label: "Nouveautés" },
  { id: "prix_asc", label: "Prix croissant" },
  { id: "prix_desc", label: "Prix décroissant" },
  { id: "km_asc", label: "Kilométrage" },
  { id: "annee_desc", label: "Année récente" },
] as const;

export const FILTER_KEYS = ["q", "dispo", "marque", "carrosserie", "carburant", "boite", "prix_max", "annee_min", "km_max", "tri", "page"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Partial<Record<FilterKey, string>>;

export function readFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const out: Filters = {};
  for (const k of FILTER_KEYS) {
    const v = sp[k];
    const s = (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 60);
    if (s) out[k] = s;
  }
  return out;
}

const num = (v?: string) => {
  const n = Number(v?.replace(/\s/g, ""));
  return v && Number.isFinite(n) && n > 0 ? n : undefined;
};

function matchesText(v: Vehicle, q: string) {
  const hay = fold([vehicleFullTitle(v), v.ref, v.fuel, v.gearbox, v.body, v.engine, v.color].join(" "));
  return fold(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

type Facet = "dispo" | "marque" | "carrosserie" | "carburant" | "boite";

function matches(v: Vehicle, f: Filters, skip?: Facet) {
  const dispo = isStatus(f.dispo) ? (f.dispo as VehicleStatus) : null;
  if (skip !== "dispo") {
    if (dispo ? v.status !== dispo : !STATUSES[v.status].listed) return false;
  } else if (!STATUSES[v.status].listed) return false;
  if (skip !== "marque" && f.marque && fold(v.brand) !== fold(f.marque)) return false;
  if (skip !== "carrosserie" && f.carrosserie && v.body !== f.carrosserie) return false;
  if (skip !== "carburant" && f.carburant && v.fuel !== f.carburant) return false;
  if (skip !== "boite" && f.boite && v.gearbox !== f.boite) return false;
  const max = num(f.prix_max);
  if (max && (v.price == null || v.price > max)) return false;
  const year = num(f.annee_min);
  if (year && (v.year == null || v.year < year)) return false;
  const km = num(f.km_max);
  if (km && (v.mileageKm == null || v.mileageKm > km)) return false;
  if (f.q && !matchesText(v, f.q)) return false;
  return true;
}

function count(list: Vehicle[], key: (v: Vehicle) => string) {
  const map = new Map<string, number>();
  for (const v of list) {
    const k = key(v);
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([value, n]) => ({ value, n }));
}

export const PAGE_SIZE = 18;

export async function searchVehicles(f: Filters) {
  const all = await publicVehicles();
  let results = all.filter((v) => matches(v, f));
  const by = <T,>(fn: (v: Vehicle) => T | null, dir: 1 | -1) =>
    (a: Vehicle, b: Vehicle) => {
      const x = fn(a), y = fn(b);
      if (x == null) return y == null ? 0 : 1;
      if (y == null) return -1;
      return x < y ? -dir : x > y ? dir : 0;
    };
  if (f.tri === "prix_asc") results = results.sort(by((v) => v.price, 1));
  if (f.tri === "prix_desc") results = results.sort(by((v) => v.price, -1));
  if (f.tri === "km_asc") results = results.sort(by((v) => v.mileageKm, 1));
  if (f.tri === "annee_desc") results = results.sort(by((v) => v.year, -1));
  if (f.tri === "recent") results = results.sort(by((v) => v.publishedAt ?? v.createdAt, -1));

  const facets = {
    dispo: PUBLIC_DISPO.map((s) => ({ value: s, n: all.filter((v) => v.status === s && matches(v, f, "dispo")).length })),
    marque: count(all.filter((v) => matches(v, f, "marque")), (v) => v.brand),
    carrosserie: count(all.filter((v) => matches(v, f, "carrosserie")), (v) => v.body),
    carburant: count(all.filter((v) => matches(v, f, "carburant")), (v) => v.fuel),
    boite: count(all.filter((v) => matches(v, f, "boite")), (v) => v.gearbox),
  };

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Math.floor(num(f.page) ?? 1)));
  return {
    total: results.length,
    page,
    pages,
    items: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    facets,
  };
}

// Brands present on the site, for the search box of the home page.
export async function brandOptions() {
  return count((await publicVehicles()).filter((v) => STATUSES[v.status].listed), (v) => v.brand);
}

export async function similarVehicles(v: Vehicle, n = 4) {
  const list = (await publicVehicles()).filter((o) => o.id !== v.id && STATUSES[o.status].listed);
  const score = (o: Vehicle) =>
    (o.brand === v.brand ? 3 : 0) +
    (o.body === v.body ? 2 : 0) +
    (v.price && o.price && Math.abs(o.price - v.price) < v.price * 0.25 ? 2 : 0) +
    (o.status === "showroom" ? 1 : 0);
  return list
    .map((o) => ({ o, s: score(o) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.o);
}
