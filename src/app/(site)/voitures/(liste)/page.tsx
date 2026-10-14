import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "@/components/Icons";
import { Pagination } from "@/components/Pagination";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { readFilters, searchVehicles, siteSettings, SORTS } from "@/lib/catalog";
import { formatAr, formatNumber, waLink } from "@/lib/format";
import { isStatus, STATUSES } from "@/lib/vehicle";
import { Filters } from "./Filters";
import { SortSelect } from "./SortSelect";

type Params = Record<string, string>;

function title(f: Params) {
  const dispo = isStatus(f.dispo) ? STATUSES[f.dispo].label : "";
  if (f.marque) return `${f.marque} d'occasion${dispo ? ` — ${dispo.toLowerCase()}` : ""}`;
  if (dispo) return `Véhicules ${dispo.toLowerCase()}`;
  return "Tous nos véhicules d'occasion";
}

export async function generateMetadata(props: PageProps<"/voitures">): Promise<Metadata> {
  const f = readFilters(await props.searchParams) as Params;
  const filtered = Object.keys(f).some((k) => !["dispo", "marque"].includes(k));
  return { title: title(f), robots: filtered ? { index: false } : undefined };
}

function href(current: Params, changes: Params) {
  const next = new URLSearchParams({ ...current, ...changes });
  for (const [k, v] of [...next.entries()]) if (!v) next.delete(k);
  const s = next.toString();
  return `/voitures${s ? `?${s}` : ""}`;
}

const CHIP_LABEL: Record<string, (v: string) => string> = {
  q: (v) => `« ${v} »`,
  dispo: (v) => (isStatus(v) ? STATUSES[v].short : v),
  prix_max: (v) => `≤ ${formatAr(Number(v))}`,
  annee_min: (v) => `Depuis ${v}`,
  km_max: (v) => `≤ ${formatNumber(Number(v))} km`,
};

export default async function CatalogPage(props: PageProps<"/voitures">) {
  const f = readFilters(await props.searchParams) as Params;
  const [result, settings] = await Promise.all([searchVehicles(f), siteSettings()]);
  const { page: _page, tri: _tri, ...active } = f;
  void _page;
  void _tri;
  const chips = Object.entries(active);
  const base: Params = { ...f };
  delete base.page;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Accueil</Link> <span aria-hidden="true">/</span> Véhicules
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{title(f)}</h1>
          <p className="mt-1 text-muted">
            {result.total} véhicule{result.total > 1 ? "s" : ""}
            {isStatus(f.dispo) ? ` · ${STATUSES[f.dispo].hint}` : " · showroom, arrivages et catalogue sur commande"}
          </p>
        </div>
        <form action="/voitures" role="search" className="flex w-full max-w-sm items-center gap-2 rounded-full border border-black/15 bg-white py-1 pr-1 pl-4 focus-within:border-cyan-deep">
          {Object.entries(base).filter(([k]) => k !== "q").map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <label htmlFor="q" className="sr-only">Rechercher un modèle</label>
          <input id="q" name="q" type="search" defaultValue={f.q ?? ""} placeholder="Tucson, Sorento 2016, diesel…" className="min-w-0 flex-1 bg-transparent py-2 outline-none" />
          <button type="submit" aria-label="Rechercher" className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
            <SearchIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <details className="card group lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold">
              Filtrer {chips.length > 0 && <span className="rounded-full bg-orange-deep px-2 text-xs text-white">{chips.length}</span>}
              <span className="text-muted transition group-open:rotate-180" aria-hidden="true">▾</span>
            </summary>
            <div className="px-4 pb-2">
              <Filters key={JSON.stringify(f)} id="m" current={f} facets={result.facets} total={result.total} />
            </div>
          </details>
          <div className="card sticky top-24 hidden px-5 pb-2 lg:block">
            <Filters key={JSON.stringify(f)} id="d" current={f} facets={result.facets} total={result.total} />
          </div>
        </aside>

        <section aria-label="Résultats">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <ul className="flex flex-wrap gap-2">
              {chips.map(([k, v]) => (
                <li key={k}>
                  <Link href={href(base, { [k]: "" })} className="chip bg-ink/90 text-white hover:bg-ink" aria-label={`Retirer le filtre ${v}`}>
                    {(CHIP_LABEL[k] ?? ((x: string) => x))(v)} <span aria-hidden="true">×</span>
                  </Link>
                </li>
              ))}
              {chips.length > 1 && (
                <li><Link href="/voitures" className="chip hover:bg-black/10">Tout effacer</Link></li>
              )}
            </ul>
            <SortSelect current={base} options={SORTS} />
          </div>

          {result.items.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((v, i) => (
                <VehicleCard key={v.id} v={v} finance={settings.finance} orderDelay={settings.orderDelay} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="card px-6 py-14 text-center">
              <p className="font-display text-2xl font-semibold">Aucun véhicule ne correspond… pour l&apos;instant.</p>
              <p className="mx-auto mt-2 max-w-md text-muted">
                Nous pouvons l&apos;importer pour vous. Dites-nous ce que vous cherchez, réponse sous 24 h.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href={`/sur-commande?${new URLSearchParams({ ...(f.marque ? { marque: f.marque } : {}), ...(f.q ? { modele: f.q } : {}) })}#demande`} className="btn-primary">
                  Le faire importer
                </Link>
                <a href={waLink(settings.whatsapp, `Bonjour, je cherche : ${[f.marque, f.q, f.carrosserie].filter(Boolean).join(" ")}`)} target="_blank" rel="noopener" className="btn-whatsapp">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
                {chips.length > 0 && <Link href="/voitures" className="btn-ghost">Effacer les filtres</Link>}
              </div>
            </div>
          )}

          <Pagination page={result.page} pageCount={result.pages} hrefFor={(p) => href(base, { page: p > 1 ? String(p) : "" })} />
        </section>
      </div>
    </div>
  );
}
