"use client";

import { useRouter } from "next/navigation";

export function SortSelect({ current, options }: { current: Record<string, string>; options: readonly { id: string; label: string }[] }) {
  const router = useRouter();
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
          router.push(`/voitures${params.size ? `?${params}` : ""}`, { scroll: false });
        }}
        className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}
