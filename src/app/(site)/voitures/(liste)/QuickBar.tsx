"use client";

import { BodyIcon } from "@/components/site/BodyIcon";
import { catalogHref, list, type Filters } from "@/lib/catalog-filter";
import { BODIES, STATUSES, type VehicleStatus } from "@/lib/vehicle";
import { useCatalogNav } from "./CatalogNav";

/**
 * The two quick choices of the catalogue, as on Moto Import: first the
 * availability (segmented control), then the type by its silhouette. Both
 * add up: "Dispo de suite" then "SUV" narrows twice.
 */
export function QuickBar({
  current,
  dispo,
  all,
  bodies,
}: {
  current: Filters;
  dispo: { value: VehicleStatus; n: number }[];
  /** Every listed vehicle, reserved ones included. */
  all: number;
  bodies: Record<string, number>;
}) {
  const { navigate } = useCatalogNav();
  const activeDispo = current.dispo ?? "";
  const activeBody = list(current.carrosserie)[0] ?? "";
  const types = BODIES.filter((b) => (bodies[b] ?? 0) > 0 || b === activeBody);
  const go = (changes: Filters) => navigate(catalogHref(current, changes));

  return (
    <div className="lg:flex lg:items-center lg:gap-5">
      <div role="group" aria-label="Disponibilité" className="grid grid-cols-4 gap-1 rounded-2xl bg-black/[0.05] p-1 lg:w-[460px] lg:shrink-0">
        {[{ value: "", label: "Tout", n: all }, ...dispo.map((d) => ({ value: d.value, label: STATUSES[d.value].short, n: d.n }))].map((d) => {
          const on = activeDispo === d.value;
          return (
            <button
              type="button"
              key={d.value || "all"}
              onClick={() => go({ dispo: d.value })}
              aria-pressed={on}
              className={`flex min-h-11 flex-col items-center justify-center rounded-xl px-1 text-center text-[13px] leading-tight font-semibold transition-colors duration-200 sm:flex-row sm:gap-1.5 ${on ? "bg-white text-ink shadow-sm" : "text-black/60 hover:text-ink"}`}
            >
              <span>{d.label}</span>
              <span className={`text-[11px] tabular-nums sm:text-xs ${on ? "text-orange-deep" : "text-muted"}`}>{d.n}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-2.5 min-w-0 lg:mt-0 lg:flex-1">
        <div role="group" aria-label="Type de véhicule" className="flex gap-2 overflow-x-auto pr-8 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ name: "", n: all }, ...types.map((b) => ({ name: b, n: bodies[b] ?? 0 }))].map((t) => {
            const on = activeBody === t.name;
            return (
              <button
                type="button"
                key={t.name || "all"}
                onClick={() => go({ carrosserie: t.name })}
                aria-pressed={on}
                className={`flex min-h-[60px] w-[84px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-1.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${on ? "border-orange-deep bg-orange/10 text-orange-deep" : "border-black/10 bg-white text-ink hover:border-ink"}`}
              >
                {t.name ? (
                  <BodyIcon type={t.name} className="h-[22px] w-[60px]" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[22px] w-[22px]" aria-hidden="true">
                    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
                    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
                    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
                    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
                  </svg>
                )}
                <span className="truncate">{t.name || "Tous"}</span>
              </button>
            );
          })}
        </div>
        {/* The row overflows: a fade says so better than an arrow on a phone. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent" aria-hidden="true" />
      </div>
    </div>
  );
}
