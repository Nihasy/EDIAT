import type { Metadata } from "next";
import Link from "next/link";
import { CloseIcon } from "@/components/Icons";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/site/SearchBox";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { searchVehicles, siteSettings } from "@/lib/catalog";
import { catalogHref, list, num, readFilters, type Filters } from "@/lib/catalog-filter";
import { formatAr, formatNumber, waLink } from "@/lib/format";
import { isStatus, STATUSES } from "@/lib/vehicle";
import { CatalogNav, PendingResults } from "./CatalogNav";
import { FilterSheet } from "./FilterSheet";
import { QuickBar } from "./QuickBar";
import { SortSelect } from "./SortSelect";

function title(f: Filters) {
  const brands = list(f.marque);
  const dispo = isStatus(f.dispo) ? STATUSES[f.dispo].label : "";
  if (brands.length) return `${brands.join(", ")} d'occasion`;
  if (f.carrosserie) return `${f.carrosserie} d'occasion`;
  if (dispo) return dispo;
  return "Nos véhicules";
}

export async function generateMetadata(props: PageProps<"/voitures">): Promise<Metadata> {
  const f = readFilters(await props.searchParams);
  const filtered = Object.keys(f).some((k) => !["dispo", "marque"].includes(k)) || list(f.marque).length > 1;
  return { title: title(f), robots: filtered ? { index: false } : undefined };
}

const short = (n: number) => (n >= 1_000_000 ? `${formatNumber(Math.round(n / 100_000) / 10).replace(".", ",")} M Ar` : formatAr(n));

// Active filters, each removable in one tap: without them, you have to reopen
// the panel to understand why the list is short.
function chips(f: Filters) {
  const out: { key: string; label: string; href: string }[] = [];
  const without = (key: keyof Filters, value: string) => catalogHref(f, { [key]: list(f[key]).filter((x) => x !== value).join(",") });
  if (f.q) out.push({ key: "q", label: `« ${f.q} »`, href: catalogHref(f, { q: "", tri: f.tri === "pertinence" ? "" : (f.tri ?? "") }) });
  for (const b of list(f.carrosserie)) out.push({ key: `c-${b}`, label: b, href: without("carrosserie", b) });
  for (const b of list(f.marque)) out.push({ key: `m-${b}`, label: b, href: without("marque", b) });
  const pmin = num(f.prix_min), pmax = num(f.prix_max);
  if (pmin || pmax) {
    const label = pmin && pmax ? `${short(pmin)} – ${short(pmax)}` : pmax ? `≤ ${short(pmax)}` : `≥ ${short(pmin!)}`;
    out.push({ key: "prix", label, href: catalogHref(f, { prix_min: "", prix_max: "" }) });
  }
  const ymin = num(f.annee_min), ymax = num(f.annee_max);
  if (ymin || ymax) {
    const label = ymin && ymax ? `${ymin} – ${ymax}` : ymax ? `Jusqu'à ${ymax}` : `Depuis ${ymin}`;
    out.push({ key: "annee", label, href: catalogHref(f, { annee_min: "", annee_max: "" }) });
  }
  const km = num(f.km_max);
  if (km) out.push({ key: "km", label: `≤ ${formatNumber(km)} km`, href: catalogHref(f, { km_max: "" }) });
  for (const v of list(f.carburant)) out.push({ key: `f-${v}`, label: v, href: without("carburant", v) });
  for (const v of list(f.boite)) out.push({ key: `g-${v}`, label: v, href: without("boite", v) });
  return out;
}

export default async function CatalogPage(props: PageProps<"/voitures">) {
  const f = readFilters(await props.searchParams);
  const [result, settings] = await Promise.all([searchVehicles(f), siteSettings()]);
  const base: Filters = { ...f };
  delete base.page;
  const active = chips(f);
  const keepForSearch: Filters = { ...base };
  delete keepForSearch.q;
  if (keepForSearch.tri === "pertinence") delete keepForSearch.tri;
  const firstBrand = list(f.marque)[0];
  const wanted = [firstBrand, f.q, f.carrosserie].filter(Boolean).join(" ");
  const whatsapp = waLink(settings.whatsapp, `Bonjour Ediat Garage, je cherche : ${wanted || "un véhicule"}`);
  const importQuery = new URLSearchParams({ ...(firstBrand ? { marque: firstBrand } : {}), ...(f.q ? { modele: f.q } : {}) });

  return (
    <CatalogNav>
      <div className="mx-auto max-w-7xl pb-10">
        <div className="px-4 pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{title(f)}</h1>
            <div className="w-full md:w-[440px]">
              <SearchBox value={f.q ?? ""} keep={keepForSearch} popularBrands={result.brands.filter((b) => b.n > 0).slice(0, 6)} whatsappHref={whatsapp} />
            </div>
          </div>
        </div>

        {/* Sticky: the two quick choices stay at hand while scrolling. */}
        <div className="sticky top-[67px] z-20 mt-4 border-y border-black/5 bg-paper/95 px-4 py-2.5 backdrop-blur lg:top-[75px]">
          <QuickBar current={base} dispo={result.dispo} all={result.dispoAll} bodies={result.bodies} />
        </div>

        <section aria-label="Résultats" className="px-4 pt-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <FilterSheet key={JSON.stringify(base)} current={base} pool={result.pool} brands={result.brands} />
            <p className="mr-auto text-sm text-muted" aria-live="polite">
              <strong className="text-base text-ink">{result.total}</strong> véhicule{result.total > 1 ? "s" : ""}
            </p>
            <SortSelect current={base} sort={result.sort} />
          </div>

          <PendingResults>
            {active.length > 0 && (
              <ul className="mb-4 flex flex-wrap items-center gap-2">
                {active.map((c) => (
                  <li key={c.key}>
                    <Link href={c.href} scroll={false} className="flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-semibold text-white hover:bg-black" aria-label={`Retirer le filtre ${c.label}`}>
                      {c.label} <CloseIcon className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                ))}
                {active.length > 1 && (
                  <li>
                    <Link href={catalogHref({ dispo: f.dispo })} scroll={false} className="flex min-h-10 items-center px-2 text-sm font-semibold text-orange-deep underline">
                      Tout effacer
                    </Link>
                  </li>
                )}
              </ul>
            )}

            {result.approximate && result.items.length > 0 && (
              <p role="status" className="mb-4 rounded-xl bg-orange/10 px-4 py-3 text-sm ring-1 ring-orange/30">
                Aucun véhicule ne correspond exactement à « {f.q} ». Voici les plus proches.
              </p>
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
                <p className="mt-1 text-muted">Dites-nous ce que vous cherchez : on l&apos;importe de Corée pour vous.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Link href={`/sur-commande?${importQuery}#demande`} className="btn-primary">
                    Le faire importer
                  </Link>
                  <a href={whatsapp} target="_blank" rel="noopener" className="btn-whatsapp">
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </a>
                  {active.length > 0 && (
                    <Link href="/voitures" className="btn-ghost">
                      Effacer les filtres
                    </Link>
                  )}
                </div>
              </div>
            )}

            <Pagination page={result.page} pageCount={result.pages} hrefFor={(p) => catalogHref(base, { page: p > 1 ? String(p) : "" })} />
          </PendingResults>
        </section>
      </div>
    </CatalogNav>
  );
}
