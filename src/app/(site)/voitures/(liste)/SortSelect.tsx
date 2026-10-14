"use client";

import { useCatalogNav } from "./CatalogNav";

export function SortSelect({ current, options }: { current: Record<string, string>; options: readonly { id: string; label: string }[] }) {
  const { navigate } = useCatalogNav();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline" aria-hidden="true">Trier</span>
      <select
        aria-label="Trier les véhicules"
        value={current.tri ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams(current);
          params.delete("page");
          if (e.target.value) params.set("tri", e.target.value);
          else params.delete("tri");
          navigate(`/voitures${params.size ? `?${params}` : ""}`);
        }}
        className="min-h-10 rounded-full border border-black/10 bg-white px-3 text-sm font-semibold"
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}
