"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAr } from "@/lib/format";
import { SearchIcon } from "../Icons";

const BUDGETS = [20_000_000, 30_000_000, 40_000_000, 50_000_000, 60_000_000, 80_000_000, 100_000_000, 150_000_000];

type Option = { value: string; n: number };

// Quick search of the home page: a plain GET form to /voitures, so it also
// works before JavaScript loads; the tabs only set the "dispo" field.
export function HeroSearch({ brands, bodies, counts }: { brands: Option[]; bodies: Option[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [dispo, setDispo] = useState("");
  const tabs = [
    { id: "", label: "Tous", n: counts.all },
    { id: "showroom", label: "Dispo de suite", n: counts.showroom },
    { id: "sur_commande", label: "Sur commande", n: counts.sur_commande },
  ];
  return (
    <form
      action="/voitures"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        for (const [k, v] of data.entries()) if (typeof v === "string" && v) params.set(k, v);
        router.push(`/voitures${params.size ? `?${params}` : ""}`);
      }}
      className="rounded-2xl bg-white p-2 text-ink shadow-2xl shadow-black/30"
    >
      <div role="radiogroup" aria-label="Disponibilité" className="flex gap-1 rounded-xl bg-paper p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={dispo === t.id}
            onClick={() => setDispo(t.id)}
            className={`flex-1 rounded-lg px-2 py-2 text-[13px] font-semibold transition sm:text-sm ${
              dispo === t.id ? "bg-ink text-white shadow" : "text-black/60 hover:text-ink"
            }`}
          >
            {t.label} <span className={dispo === t.id ? "text-orange" : "text-black/40"}>{t.n}</span>
          </button>
        ))}
      </div>
      <input type="hidden" name="dispo" value={dispo} />
      <div className="grid gap-2 p-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="block">
          <span className="label">Marque</span>
          <select name="marque" className="input" defaultValue="">
            <option value="">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b.value} value={b.value}>{b.value} ({b.n})</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Type</span>
          <select name="carrosserie" className="input" defaultValue="">
            <option value="">Tous les types</option>
            {bodies.map((b) => (
              <option key={b.value} value={b.value}>{b.value} ({b.n})</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Budget max.</span>
          <select name="prix_max" className="input" defaultValue="">
            <option value="">Sans limite</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>{formatAr(b)}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="btn-primary h-[46px] w-full px-6 text-[15px]">
            <SearchIcon className="h-5 w-5" /> Rechercher
          </button>
        </div>
      </div>
    </form>
  );
}
