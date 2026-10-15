"use client";

import { useRef } from "react";
import { formatAr, formatNumber } from "@/lib/format";
import type { VehicleStatus } from "@/lib/vehicle";
import { Spinner } from "@/components/ui/Spinner";
import { useCatalogNav } from "./CatalogNav";

type Option = { value: string; n: number };
export type Facets = {
  dispo: { value: VehicleStatus; n: number }[];
  marque: Option[];
  carrosserie: Option[];
  carburant: Option[];
  boite: Option[];
};

const PRICES = [15_000_000, 20_000_000, 30_000_000, 40_000_000, 50_000_000, 60_000_000, 80_000_000, 100_000_000, 150_000_000];
const KMS = [50_000, 80_000, 100_000, 150_000, 200_000];

// Filters apply as soon as they change (GET form: also works without JS).
export function Filters({ current, facets, total, id }: { current: Record<string, string>; facets: Facets; total: number; id: string }) {
  const form = useRef<HTMLFormElement>(null);
  const { pending, navigate } = useCatalogNav();
  const year = new Date().getFullYear();

  function apply() {
    const data = new FormData(form.current!);
    const params = new URLSearchParams();
    for (const [k, v] of data.entries()) if (typeof v === "string" && v) params.set(k, v);
    if (current.tri) params.set("tri", current.tri);
    navigate(`/voitures${params.size ? `?${params}` : ""}`);
  }

  const radios = (name: string, options: Option[], labelOf: (v: string) => string = (v) => v) => (
    <fieldset className="border-t border-black/10 py-4">
      <legend className="label float-left mb-2 w-full">{FIELD_LABELS[name]}</legend>
      <div className="clear-both flex flex-wrap gap-1.5">
        {[{ value: "", n: -1 }, ...options].map((o) => {
          const checked = (current[name] ?? "") === o.value;
          return (
            <label
              key={o.value || "all"}
              className={`flex min-h-11 cursor-pointer items-center rounded-full border px-3.5 text-[13px] transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan ${
                checked ? "border-ink bg-ink font-semibold text-white" : "border-black/15 bg-white hover:border-ink"
              } ${o.n === 0 && !checked ? "opacity-40" : ""}`}
            >
              <input type="radio" name={name} value={o.value} defaultChecked={checked} onChange={apply} className="sr-only" />
              {o.value ? labelOf(o.value) : "Tous"}
              {o.n >= 0 && <span className={`ml-1 tabular-nums ${checked ? "text-white/70" : "text-muted"}`}>{o.n}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <form ref={form} action="/voitures" onSubmit={(e) => { e.preventDefault(); apply(); }} aria-label="Filtres" className="relative">
      {current.q && <input type="hidden" name="q" value={current.q} />}
      {current.dispo && <input type="hidden" name="dispo" value={current.dispo} />}
      {facets.marque.length > 0 && (
        <div className="border-t border-black/10 py-4">
          <label className="label" htmlFor={`${id}-marque`}>Marque</label>
          <select id={`${id}-marque`} name="marque" defaultValue={current.marque ?? ""} onChange={apply} className="input">
            <option value="">Toutes</option>
            {facets.marque.map((o) => <option key={o.value} value={o.value}>{o.value} ({o.n})</option>)}
            {current.marque && !facets.marque.some((o) => o.value === current.marque) && <option value={current.marque}>{current.marque} (0)</option>}
          </select>
        </div>
      )}
      {facets.carrosserie.length > 0 && radios("carrosserie", facets.carrosserie)}
      {facets.carburant.length > 0 && radios("carburant", facets.carburant)}
      {facets.boite.length > 0 && radios("boite", facets.boite)}
      <div className="grid grid-cols-1 gap-3 border-t border-black/10 py-4">
        <div>
          <label className="label" htmlFor={`${id}-prix`}>Budget maximum</label>
          <select id={`${id}-prix`} name="prix_max" defaultValue={current.prix_max ?? ""} onChange={apply} className="input">
            <option value="">Sans limite</option>
            {PRICES.map((p) => <option key={p} value={p}>{formatAr(p)}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor={`${id}-annee`}>Année min.</label>
            <select id={`${id}-annee`} name="annee_min" defaultValue={current.annee_min ?? ""} onChange={apply} className="input">
              <option value="">Toutes</option>
              {Array.from({ length: 16 }, (_, i) => year - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor={`${id}-km`}>Km max.</label>
            <select id={`${id}-km`} name="km_max" defaultValue={current.km_max ?? ""} onChange={apply} className="input">
              <option value="">Tous</option>
              {KMS.map((k) => <option key={k} value={k}>{formatNumber(k)} km</option>)}
            </select>
          </div>
        </div>
      </div>
      <noscript>
        <button type="submit" className="btn-dark w-full">Appliquer</button>
      </noscript>
      <p className="flex h-6 items-center gap-2 text-sm text-muted" aria-live="polite">
        {pending ? <><Spinner /> Mise à jour…</> : `${total} véhicule${total > 1 ? "s" : ""}`}
      </p>
    </form>
  );
}

const FIELD_LABELS: Record<string, string> = {
  carrosserie: "Type de véhicule",
  carburant: "Carburant",
  boite: "Boîte de vitesses",
};
