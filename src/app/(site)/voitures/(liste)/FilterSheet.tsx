"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

// Phones and tablets: filters open in a full-height panel from a button in the
// sticky toolbar. Large screens show them in the sidebar instead. The panel is
// rendered at the end of <body>: inside the toolbar (blurred background), a
// fixed panel would be positioned and clipped by the toolbar.
const noop = () => () => {};
export function FilterSheet({ active, total, children }: { active: number; total: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="filter-sheet"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
        Filtres {active > 0 && <span className="rounded-full bg-orange px-1.5 text-xs">{active}</span>}
      </button>
      {mounted && createPortal(
      <div
        id="filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Filtres"
        hidden={!open}
        className="fixed inset-0 z-50 lg:hidden"
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-3xl bg-white shadow-2xl sm:inset-x-auto sm:top-0 sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
            <p className="font-display text-xl font-bold">Filtres</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-full text-2xl hover:bg-black/5">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-5">{children}</div>
          <div className="border-t border-black/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={() => setOpen(false)} className="btn-primary w-full">
              Voir {total} véhicule{total > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>,
      document.body)}
    </>
  );
}
