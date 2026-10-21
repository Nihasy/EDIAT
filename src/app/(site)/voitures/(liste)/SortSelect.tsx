"use client";

import { useEffect, useRef, useState } from "react";
import { catalogHref, SORTS, type Filters } from "@/lib/catalog-filter";
import { CheckIcon } from "@/components/Icons";
import { useCatalogNav } from "./CatalogNav";

/**
 * Sort menu: criterion and direction in one panel (from Moto Import). The
 * direction starts where buyers expect it: cheapest, lowest mileage, newest.
 */
export function SortSelect({ current, sort }: { current: Filters; sort: string }) {
  const { navigate } = useCatalogNav();
  const [open, setOpen] = useState(false);
  // The panel opens towards the side with room (the button moves between left and right with the width).
  const [alignRight, setAlignRight] = useState(false);
  const toggle = () => {
    const r = box.current?.getBoundingClientRect();
    if (r) setAlignRight(r.left + 240 > window.innerWidth - 16);
    setOpen((v) => !v);
  };
  const box = useRef<HTMLDivElement>(null);
  const criteria = SORTS.filter((s) => s.id !== "pertinence" || current.q);
  const crit = SORTS.find((s) => s.id === sort) ?? SORTS[0];
  const dir = current.ordre === "asc" || current.ordre === "desc" ? current.ordre : crit.dir;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The default criterion is not written in the URL: relevance when searching, availability otherwise.
  const defaultSort = current.q ? "pertinence" : "";
  const pick = (id: string) => {
    setOpen(false);
    navigate(catalogHref(current, { tri: id === defaultSort ? "" : id || (current.q ? "dispo" : ""), ordre: "" }));
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex min-h-11 items-center gap-1.5 rounded-full border bg-white px-4 text-sm font-semibold transition-colors ${open ? "border-ink" : "border-black/10 hover:border-ink"}`}
      >
        <span className="text-muted">Trier :</span>
        <span>{crit.label}</span>
        {crit.dir && <span aria-hidden="true" className="text-orange-deep">{dir === "asc" ? "↑" : "↓"}</span>}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className={`absolute z-40 mt-2 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/10 ${alignRight ? "right-0" : "left-0"}`}>
          <ul role="listbox" aria-label="Critère de tri" className="py-1">
            {criteria.map((s) => {
              const on = s.id === crit.id;
              return (
                <li key={s.id || "dispo"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => pick(s.id)}
                    className={`flex min-h-11 w-full items-center justify-between px-4 text-left text-sm ${on ? "font-semibold text-orange-deep" : "hover:bg-paper"}`}
                  >
                    {s.label}
                    {on && <CheckIcon className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {crit.dir && (
            <div role="group" aria-label="Sens du tri" className="grid grid-cols-2 gap-1 border-t border-black/10 p-2">
              {(
                [
                  ["asc", "Croissant", "↑"],
                  ["desc", "Décroissant", "↓"],
                ] as const
              ).map(([d, label, arrow]) => (
                <button
                  type="button"
                  key={d}
                  aria-pressed={dir === d}
                  onClick={() => {
                    setOpen(false);
                    navigate(catalogHref(current, { ordre: d === crit.dir ? "" : d }));
                  }}
                  className={`flex min-h-10 items-center justify-center gap-1 rounded-xl text-[13px] font-semibold ${dir === d ? "bg-ink text-white" : "bg-paper hover:bg-black/10"}`}
                >
                  <span aria-hidden="true">{arrow}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
