"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/Icons";
import { useDialog } from "@/components/useDialog";
import { BRAND_LOGOS } from "@/lib/brands";
import { catalogHref, list, matchFilters, num, panelFilterCount, type Filterable, type Filters } from "@/lib/catalog-filter";
import { fold, formatNumber } from "@/lib/format";
import { FUELS, GEARBOXES } from "@/lib/vehicle";
import { useCatalogNav } from "./CatalogNav";

// Steps of the budget slider, in Ariary: finer where decisions happen.
const range = (from: number, to: number, step: number) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);
const BUDGET = [0, ...range(5_000_000, 50_000_000, 2_500_000), ...range(55_000_000, 150_000_000, 5_000_000), ...range(160_000_000, 300_000_000, 10_000_000), ...range(325_000_000, 500_000_000, 25_000_000)];
const KM = [...range(10_000, 100_000, 10_000), ...range(125_000, 300_000, 25_000), Infinity];
const YEAR_MAX = new Date().getFullYear() + 1;
const YEAR_MIN = 1995;

const stepOf = (scale: number[], v: number | undefined, fallback: number) => {
  if (v === undefined) return fallback;
  const i = scale.findIndex((s) => s >= v);
  return i === -1 ? scale.length - 1 : i;
};

// "52,5 M Ar": budgets read in millions.
function short(n: number) {
  if (n >= 1_000_000) return `${formatNumber(Math.round(n / 100_000) / 10).replace(".", ",")} M Ar`;
  return `${formatNumber(n)} Ar`;
}

const noop = () => () => {};

export function FilterSheet({
  current,
  pool,
  brands,
}: {
  current: Filters;
  /** Vehicles matching the text search: counted in the browser before applying. */
  pool: Filterable[];
  brands: { name: string; n: number }[];
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<Filters>(current);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const dialog = useRef<HTMLDivElement>(null);
  const { navigate } = useCatalogNav();
  useDialog(dialog, open, () => setOpen(false));
  const active = panelFilterCount(current);

  const count = useMemo(() => pool.filter((v) => matchFilters(v, local)).length, [pool, local]);
  const set = (changes: Filters) => setLocal((s) => ({ ...s, ...changes }));
  const toggle = (key: "marque" | "carburant" | "boite", value: string) => {
    const now = list(local[key]);
    const next = now.includes(value) ? now.filter((x) => x !== value) : [...now, value];
    set({ [key]: next.join(",") });
  };

  const pmin = num(local.prix_min), pmax = num(local.prix_max);
  const ymin = num(local.annee_min), ymax = num(local.annee_max);
  const kmax = num(local.km_max);
  const budgetSummary = pmin && pmax ? `${short(pmin)} – ${short(pmax)}` : pmax ? `≤ ${short(pmax)}` : pmin ? `≥ ${short(pmin)}` : "Tous";
  const yearSummary = ymin && ymax ? (ymin === ymax ? String(ymin) : `${ymin} – ${ymax}`) : ymax ? `≤ ${ymax}` : ymin ? `Depuis ${ymin}` : "Toutes";
  const brandsOn = list(local.marque);
  const fuelsOn = list(local.carburant);
  const boxesOn = list(local.boite);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLocal(current);
          setOpen(true);
        }}
        aria-expanded={open}
        aria-controls="filter-sheet"
        className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink/90"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="10" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
        Affiner
        {active > 0 && <span className="rounded-full bg-orange px-1.5 text-xs tabular-nums">{active}</span>}
      </button>
      {mounted &&
        createPortal(
          <div ref={dialog} id="filter-sheet" role="dialog" aria-modal="true" aria-label="Affiner la recherche" hidden={!open} className="fixed inset-y-0 left-0 z-50 w-screen">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] max-w-[680px] flex-col rounded-t-3xl bg-white shadow-2xl sm:bottom-6 sm:rounded-3xl">
              <div className="flex items-center justify-between border-b border-black/10 py-2 pr-2 pl-5">
                <p className="font-display text-xl font-bold">Affiner la recherche</p>
                <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5">
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5">
                <Section title="Budget" summary={budgetSummary} on={!!(pmin || pmax)} defaultOpen>
                  <DualRange
                    last={BUDGET.length - 1}
                    lo={stepOf(BUDGET, pmin, 0)}
                    hi={stepOf(BUDGET, pmax, BUDGET.length - 1)}
                    label={(i, end) => (end === "lo" ? (i === 0 ? "0 Ar" : short(BUDGET[i])) : i === BUDGET.length - 1 ? "Sans limite" : short(BUDGET[i]))}
                    ends={["0 Ar", "500 M Ar"]}
                    names={["Budget minimum", "Budget maximum"]}
                    onChange={(lo, hi) => set({ prix_min: lo === 0 ? "" : String(BUDGET[lo]), prix_max: hi === BUDGET.length - 1 ? "" : String(BUDGET[hi]) })}
                  />
                </Section>

                <Section title="Marque" summary={brandsOn.length ? brandsOn.join(", ") : "Toutes"} on={brandsOn.length > 0} defaultOpen={brandsOn.length > 0}>
                  <BrandList brands={brands} selected={brandsOn} onToggle={(b) => toggle("marque", b)} onClear={() => set({ marque: "" })} />
                </Section>

                <Section title="Année" summary={yearSummary} on={!!(ymin || ymax)} defaultOpen={!!(ymin || ymax)}>
                  <DualRange
                    last={YEAR_MAX - YEAR_MIN}
                    lo={(ymin ?? YEAR_MIN) - YEAR_MIN}
                    hi={(ymax ?? YEAR_MAX) - YEAR_MIN}
                    label={(i) => String(YEAR_MIN + i)}
                    ends={[String(YEAR_MIN), String(YEAR_MAX)]}
                    names={["Année minimum", "Année maximum"]}
                    onChange={(lo, hi) => set({ annee_min: lo === 0 ? "" : String(YEAR_MIN + lo), annee_max: hi === YEAR_MAX - YEAR_MIN ? "" : String(YEAR_MIN + hi) })}
                  />
                </Section>

                <Section title="Kilométrage" summary={kmax ? `≤ ${formatNumber(kmax)} km` : "Tous"} on={!!kmax} defaultOpen={!!kmax}>
                  <SingleRange
                    last={KM.length - 1}
                    value={stepOf(KM, kmax, KM.length - 1)}
                    label={(i) => (KM[i] === Infinity ? "Sans limite" : `${formatNumber(KM[i])} km`)}
                    ends={["10 000 km", "Sans limite"]}
                    name="Kilométrage maximum"
                    onChange={(i) => set({ km_max: KM[i] === Infinity ? "" : String(KM[i]) })}
                  />
                </Section>

                <Section title="Carburant" summary={fuelsOn.length ? fuelsOn.join(", ") : "Tous"} on={fuelsOn.length > 0} defaultOpen>
                  <Chips options={FUELS} selected={fuelsOn} onToggle={(v) => toggle("carburant", v)} />
                </Section>

                <Section title="Boîte de vitesses" summary={boxesOn.length ? boxesOn.join(", ") : "Toutes"} on={boxesOn.length > 0} defaultOpen>
                  <Chips options={GEARBOXES} selected={boxesOn} onToggle={(v) => toggle("boite", v)} />
                </Section>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-black/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    setLocal({ q: current.q, dispo: current.dispo, carrosserie: current.carrosserie, tri: current.tri, ordre: current.ordre })
                  }
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={count === 0}
                  onClick={() => {
                    setOpen(false);
                    navigate(
                      catalogHref(current, {
                        marque: local.marque ?? "",
                        carburant: local.carburant ?? "",
                        boite: local.boite ?? "",
                        prix_min: local.prix_min ?? "",
                        prix_max: local.prix_max ?? "",
                        annee_min: local.annee_min ?? "",
                        annee_max: local.annee_max ?? "",
                        km_max: local.km_max ?? "",
                      }),
                    );
                  }}
                >
                  {count === 0 ? "Aucun véhicule" : `Voir ${count} véhicule${count > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/** Collapsible section: the header sums up the choice, the body changes it. */
function Section({ title, summary, on, defaultOpen = false, children }: { title: string; summary: string; on: boolean; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-black/10 last:border-0">
      <h3>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex min-h-14 w-full items-center justify-between gap-3 text-left">
          <span className="text-[15px] font-semibold">{title}</span>
          <span className="flex min-w-0 items-center gap-2">
            <span className={`truncate text-sm ${on ? "font-semibold text-orange-deep" : "text-muted"}`}>{summary}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      </h3>
      {open && <div className="pb-5">{children}</div>}
    </section>
  );
}

/** Two handles on one rail; ± buttons for the exact value (hard with a finger). */
function DualRange({
  last,
  lo,
  hi,
  label,
  ends,
  names,
  onChange,
}: {
  last: number;
  lo: number;
  hi: number;
  label: (step: number, end: "lo" | "hi") => string;
  ends: [string, string];
  names: [string, string];
  onChange: (lo: number, hi: number) => void;
}) {
  const pct = (i: number) => (i / last) * 100;
  const setLo = (i: number) => onChange(Math.max(0, Math.min(i, hi - 1)), hi);
  const setHi = (i: number) => onChange(lo, Math.min(last, Math.max(i, lo + 1)));
  return (
    <div>
      <div className="mb-3 space-y-1.5">
        <Stepper title="Minimum" value={label(lo, "lo")} onMinus={() => setLo(lo - 1)} onPlus={() => setLo(lo + 1)} minusOff={lo <= 0} plusOff={lo >= hi - 1} />
        <Stepper title="Maximum" value={label(hi, "hi")} onMinus={() => setHi(hi - 1)} onPlus={() => setHi(hi + 1)} minusOff={hi <= lo + 1} plusOff={hi >= last} />
      </div>
      <div className="relative h-10">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black/10" aria-hidden="true" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-orange-deep" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} aria-hidden="true" />
        {/* The low handle comes forward at the far end, or it would be stuck under the other one. */}
        <input type="range" min={0} max={last} step={1} value={lo} onChange={(e) => setLo(Number(e.target.value))} className={`range-thumb ${lo > last - 2 ? "z-20" : "z-10"}`} aria-label={names[0]} aria-valuetext={label(lo, "lo")} />
        <input type="range" min={0} max={last} step={1} value={hi} onChange={(e) => setHi(Number(e.target.value))} className="range-thumb z-10" aria-label={names[1]} aria-valuetext={label(hi, "hi")} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  );
}

function SingleRange({ last, value, label, ends, name, onChange }: { last: number; value: number; label: (i: number) => string; ends: [string, string]; name: string; onChange: (i: number) => void }) {
  const set = (i: number) => onChange(Math.max(0, Math.min(last, i)));
  return (
    <div>
      <div className="mb-3">
        <Stepper title="Maximum" value={label(value)} onMinus={() => set(value - 1)} onPlus={() => set(value + 1)} minusOff={value <= 0} plusOff={value >= last} />
      </div>
      <div className="relative h-10">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black/10" aria-hidden="true" />
        <div className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-orange-deep" style={{ width: `${(value / last) * 100}%` }} aria-hidden="true" />
        <input type="range" min={0} max={last} step={1} value={value} onChange={(e) => set(Number(e.target.value))} className="range-thumb z-10" aria-label={name} aria-valuetext={label(value)} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  );
}

function Stepper({ title, value, onMinus, onPlus, minusOff, plusOff }: { title: string; value: string; onMinus: () => void; onPlus: () => void; minusOff: boolean; plusOff: boolean }) {
  const btn = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/15 text-lg font-bold transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-black/15";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-muted">{title}</span>
      <span className="flex items-center gap-2">
        <button type="button" onClick={onMinus} disabled={minusOff} aria-label={`${title} : un cran en moins`} className={btn}>
          −
        </button>
        <span className="min-w-[112px] text-center text-[16px] font-bold tabular-nums">{value}</span>
        <button type="button" onClick={onPlus} disabled={plusOff} aria-label={`${title} : un cran en plus`} className={btn}>
          +
        </button>
      </span>
    </div>
  );
}

/** Several brands at once, searchable; brands in stock come first. */
function BrandList({ brands, selected, onToggle, onClear }: { brands: { name: string; n: number }[]; selected: string[]; onToggle: (b: string) => void; onClear: () => void }) {
  const [q, setQ] = useState("");
  const shown = brands.filter((b) => fold(b.name).includes(fold(q.trim())));
  const inStock = brands.filter((b) => b.n > 0).length;
  return (
    <div>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher une marque" aria-label="Chercher une marque" className="input mb-2 text-[16px]" />
      <p className="mb-1.5 text-xs text-muted">
        {inStock} marque{inStock > 1 ? "s" : ""} en stock en premier, puis toutes les autres (sur commande).
      </p>
      <div className="max-h-72 overflow-y-auto rounded-xl ring-1 ring-black/10">
        {shown.length ? (
          shown.map((b) => {
            const on = selected.includes(b.name);
            return (
              <button
                type="button"
                key={b.name}
                onClick={() => onToggle(b.name)}
                aria-pressed={on}
                className={`flex min-h-12 w-full items-center gap-3 px-3 text-left text-[15px] transition-colors ${on ? "bg-orange/10 font-semibold" : "hover:bg-paper"}`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${on ? "border-orange-deep bg-orange-deep text-white" : "border-black/25 bg-white"}`} aria-hidden="true">
                  {on && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/10">
                  {BRAND_LOGOS[b.name] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={BRAND_LOGOS[b.name]} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="flex-1 truncate">{b.name}</span>
                <span className="text-xs text-muted tabular-nums">{b.n > 0 ? b.n : ""}</span>
              </button>
            );
          })
        ) : (
          <p className="px-3 py-4 text-sm text-muted">Aucune marque à ce nom.</p>
        )}
      </div>
      {selected.length > 0 && (
        <button type="button" onClick={onClear} className="mt-2 min-h-10 text-sm font-semibold text-orange-deep underline">
          Décocher {selected.length > 1 ? `les ${selected.length} marques` : "la marque"}
        </button>
      )}
    </div>
  );
}

function Chips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => onToggle(o)}
            aria-pressed={on}
            className={`min-h-11 rounded-full border px-4 text-sm transition-colors ${on ? "border-ink bg-ink font-semibold text-white" : "border-black/15 bg-white hover:border-ink"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
