import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { queryStatic } from "./db";
import { BRANDS } from "./brands";
import { matchFilters, num, SORTS, toFilterable, type Filters } from "./catalog-filter";
import { formatNumber } from "./format";
import { thumbUrl } from "./images";
import { BODY_WORDS, BRAND_NICKNAMES, normalize, scoreTexts, searchList } from "./search";
import { parseSettings } from "./settings-shared";
import { BODIES, PUBLIC_DISPO, STATUSES, vehicleTitle, type Vehicle, type VehicleStatus } from "./vehicle";
import { toVehicle } from "./vehicles";

// Everything the public site shows comes from this snapshot, kept in the
// Next.js cache: visitors and crawlers do not wake the database. Any
// back-office change clears it at once (refreshSite in admin/actions clears
// SITE_TAG), so the timer is only a safety net for direct database writes.
// One day, not one hour: on Vercel each rewrite counts against the team's
// cache-write quota, shared with Moto Import, whose free plan was paused for
// exceeding it on 10/10/2026.
export const SITE_TAG = "site";
const snapshot = { tags: [SITE_TAG], revalidate: 86400 };

// Private columns (cost, notes) are never selected for the public site.
const PUBLIC_COLUMNS = `id, ref, status, brand, model, version, year, mileage_km, fuel, gearbox, body, drive, engine,
  power_hp, seats, doors, color, origin, price, old_price, monthly_override, financing, eta, featured,
  description, equipment, images, created_at, updated_at, published_at, sold_at`;

const readVehicles = unstable_cache(
  async () => queryStatic(`SELECT ${PUBLIC_COLUMNS} FROM vehicles WHERE status <> 'brouillon'`),
  ["site-vehicles-v2"], // bump to force a fresh read after a change of columns or a direct database fix
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

function count(list: Vehicle[], key: (v: Vehicle) => string) {
  const map = new Map<string, number>();
  for (const v of list) {
    const k = key(v);
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export const PAGE_SIZE = 18;

type Key<T> = (v: Vehicle) => T | null;
const by =
  <T,>(fn: Key<T>, dir: 1 | -1) =>
  (a: Vehicle, b: Vehicle) => {
    const x = fn(a), y = fn(b);
    if (x == null) return y == null ? 0 : 1;
    if (y == null) return -1;
    return x < y ? -dir : x > y ? dir : 0;
  };
const SORT_KEYS: Record<string, Key<number | string>> = {
  recent: (v) => v.publishedAt ?? v.createdAt,
  prix: (v) => v.price,
  km: (v) => v.mileageKm,
  annee: (v) => v.year,
};

export async function searchVehicles(f: Filters) {
  const listed = (await publicVehicles()).filter((v) => STATUSES[v.status].listed);
  // Text first: the filter panel counts its results among these.
  const { found, approximate } = searchList(listed, f.q);
  const scores = new Map(found.map((x) => [x.item.id, x.score]));
  const textHits = found.map((x) => x.item);
  let results = textHits.filter((v) => matchFilters(v, f));

  const sort = f.tri ?? (f.q ? "pertinence" : "");
  if (sort === "pertinence" && f.q) {
    // Availability still comes first: a sold-out match never beats one on sale.
    results = [...results].sort(
      (a, b) => STATUSES[a.status].rank - STATUSES[b.status].rank || (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0),
    );
  } else if (SORT_KEYS[sort]) {
    const def = SORTS.find((s) => s.id === sort)?.dir ?? "desc";
    const dir = (f.ordre === "asc" || f.ordre === "desc" ? f.ordre : def) === "asc" ? 1 : -1;
    results = [...results].sort(by(SORT_KEYS[sort], dir));
  }

  const dispo = PUBLIC_DISPO.map((s) => ({
    value: s,
    n: textHits.filter((v) => v.status === s && matchFilters(v, f, "dispo")).length,
  }));
  const dispoAll = textHits.filter((v) => matchFilters(v, f, "dispo")).length;
  const bodies = count(textHits.filter((v) => matchFilters(v, f, "carrosserie")), (v) => v.body);
  const brands = count(listed, (v) => v.brand);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Math.floor(num(f.page) ?? 1)));
  return {
    total: results.length,
    page,
    pages,
    items: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    approximate,
    sort,
    dispo,
    dispoAll,
    bodies: Object.fromEntries(bodies),
    // Brands in stock first (most cars first), then every other brand A–Z.
    brands: [
      ...[...brands.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n })),
      ...BRANDS.filter((b) => !brands.has(b)).map((name) => ({ name, n: 0 })),
    ],
    // Light list for the filter panel's live count.
    pool: textHits.map(toFilterable),
  };
}

export type Suggestions = {
  total: number;
  approximate: boolean;
  brands: { name: string; n: number }[];
  bodies: { name: string; n: number }[];
  vehicles: { slug: string; title: string; detail: string; price: number | null; status: VehicleStatus; image: string | null }[];
};

// Search-as-you-type: brands and types the query names, then the best vehicles.
export async function suggest(q: string): Promise<Suggestions> {
  const listed = (await publicVehicles()).filter((v) => STATUSES[v.status].listed);
  const { found, approximate } = searchList(listed, q);
  const stock = count(listed, (v) => v.brand);
  const brands = BRANDS.map((name) => ({ name, n: stock.get(name) ?? 0, s: scoreTexts([name, BRAND_NICKNAMES[normalize(name)] ?? ""], q) }))
    .filter((b) => b.s >= 0.8 || (b.s > 0 && b.n > 0))
    .sort((a, b) => b.s - a.s || b.n - a.n)
    .slice(0, 3)
    .map(({ name, n }) => ({ name, n }));
  const bodyCount = count(listed, (v) => v.body);
  const bodies = BODIES.map((name) => ({ name, n: bodyCount.get(name) ?? 0, s: scoreTexts([name, BODY_WORDS[name] ?? ""], q) }))
    .filter((b) => b.s > 0 && b.n > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map(({ name, n }) => ({ name, n }));
  const vehicles = [...found]
    .sort((a, b) => STATUSES[a.item.status].rank - STATUSES[b.item.status].rank || b.score - a.score)
    .slice(0, 6)
    .map(({ item: v }) => ({
      slug: v.slug,
      title: vehicleTitle(v) + (v.version ? ` ${v.version}` : ""),
      detail: [v.year, v.mileageKm != null ? `${formatNumber(v.mileageKm)} km` : "", v.fuel, v.gearbox].filter(Boolean).join(" · "),
      price: v.price,
      status: v.status,
      image: v.images[0] ? thumbUrl(v.images[0]) : null,
    }));
  return { total: found.length, approximate, brands, bodies, vehicles };
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
