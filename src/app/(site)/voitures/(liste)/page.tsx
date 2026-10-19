import type { Metadata } from "next";
import Link from "next/link";
import { CloseIcon, SearchIcon } from "@/components/Icons";
import { Pagination } from "@/components/Pagination";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { readFilters, searchVehicles, siteSettings, SORTS } from "@/lib/catalog";
import { formatAr, formatNumber, waLink } from "@/lib/format";
import { isStatus, PUBLIC_DISPO, STATUSES } from "@/lib/vehicle";
import { CatalogNav, NavChip, PendingResults } from "./CatalogNav";
import { Filters } from "./Filters";
import { FilterSheet } from "./FilterSheet";
import { SortSelect } from "./SortSelect";

type Params = Record<string, string>;

function title(f: Params) {
  const dispo = isStatus(f.dispo) ? STATUSES[f.dispo].label : "";
  if (f.marque) return `${f.marque} d'occasion`;
  if (f.carrosserie) return `${f.carrosserie} d'occasion`;
  if (dispo) return dispo;
  return "Nos véhicules";
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
  const base: Params = { ...f };
  delete base.page;
  const chips = Object.entries(base).filter(([k]) => k !== "tri" && k !== "dispo");
  const activeCount = Object.keys(base).filter((k) => k !== "tri" && k !== "q").length;

  return (
    <CatalogNav>
    <div className="mx-auto max-w-7xl pb-10">
      <div className="px-4 pt-4 sm:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {title(f)} <span className="text-xl font-semibold text-muted">{result.total}</span>
          </h1>
          <form action="/voitures" role="search" className="flex w-full items-center gap-2 rounded-full bg-white py-1 pr-1 pl-4 ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-cyan-deep sm:w-80">
            {Object.entries(base).filter(([k]) => k !== "q").map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
            <label htmlFor="q" className="sr-only">Rechercher un modèle</label>
            <input id="q" name="q" type="search" defaultValue={f.q ?? ""} placeholder="Modèle, année, diesel…" className="min-h-11 min-w-0 flex-1 bg-transparent outline-none" />
            <button type="submit" aria-label="Rechercher" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white"><SearchIcon className="h-5 w-5" /></button>
          </form>
        </div>
      </div>

      {/* Sticky toolbar: filters button (phones/tablets), availability chips, sort. */}
      <div className="sticky top-[67px] z-20 mt-3 border-y border-black/5 bg-paper/95 backdrop-blur lg:top-[75px]">
        <div className="relative flex items-center gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterSheet active={activeCount} total={result.total}>
            <Filters key={JSON.stringify(f)} id="m" current={f} facets={result.facets} total={result.total} />
          </FilterSheet>
          {[{ id: "", label: "Tous" }, ...PUBLIC_DISPO.map((s) => ({ id: s, label: STATUSES[s].short }))].map((d) => {
            const on = (f.dispo ?? "") === d.id;
            const n = d.id ? result.facets.dispo.find((x) => x.value === d.id)?.n : undefined;
            return (
              <NavChip key={d.id || "all"} href={href(base, { dispo: d.id })} active={on}>
                {d.label}{n != null && <span className={on ? "ml-1 text-white/75" : "ml-1 text-muted"}>{n}</span>}
              </NavChip>
            );
          })}
          <div className="ml-auto shrink-0 pl-2">
            <SortSelect current={base} options={SORTS} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-6 px-4 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-2xl bg-white px-5 pb-2 ring-1 ring-black/5">
            <Filters key={JSON.stringify(f)} id="d" current={f} facets={result.facets} total={result.total} />
          </div>
        </aside>

        <section aria-label="Résultats" className="min-w-0">
          <PendingResults>
          {chips.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-2">
              {chips.map(([k, v]) => (
                <li key={k}>
                  <Link href={href(base, { [k]: "" })} className="chip min-h-10 px-3.5 bg-ink/90 text-white hover:bg-ink" aria-label={`Retirer le filtre ${v}`}>
                    {(CHIP_LABEL[k] ?? ((x: string) => x))(v)} <CloseIcon className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
              {chips.length > 1 && <li><Link href={href({}, { dispo: f.dispo ?? "" })} className="chip min-h-10 px-3.5 hover:bg-black/10">Tout effacer</Link></li>}
            </ul>
          )}

          <h2 className="sr-only">Résultats</h2>
          {result.items.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {result.items.map((v, i) => (
                // Wrapper carries the scroll reveal: an animation on the card itself would cancel its hover lift.
                <div key={v.id} className="reveal">
                  <VehicleCard v={v} finance={settings.finance} orderDelay={settings.orderDelay} priority={i < 4} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-black/5">
              <p className="font-display text-2xl font-semibold">Aucun véhicule pour l&apos;instant</p>
              <p className="mt-1 text-muted">On peut l&apos;importer pour vous.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link href={`/sur-commande?${new URLSearchParams({ ...(f.marque ? { marque: f.marque } : {}), ...(f.q ? { modele: f.q } : {}) })}#demande`} className="btn-primary">
                  Le faire importer
                </Link>
                <a href={waLink(settings.whatsapp, `Bonjour, je cherche : ${[f.marque, f.q, f.carrosserie].filter(Boolean).join(" ")}`)} target="_blank" rel="noopener" className="btn-whatsapp">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
                {activeCount > 0 && <Link href="/voitures" className="btn-ghost">Effacer les filtres</Link>}
              </div>
            </div>
          )}

          <Pagination page={result.page} pageCount={result.pages} hrefFor={(p) => href(base, { page: p > 1 ? String(p) : "" })} />
          </PendingResults>
        </section>
      </div>
    </div>
    </CatalogNav>
  );
}
