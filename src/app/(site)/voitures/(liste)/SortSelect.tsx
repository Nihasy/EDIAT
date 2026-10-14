"use client";

import { useRouter } from "next/navigation";

export function SortSelect({ current, options }: { current: Record<string, string>; options: readonly { id: string; label: string }[] }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Trier par</span>
      <select
        value={current.tri ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams(current);
          params.delete("page");
          if (e.target.value) params.set("tri", e.target.value);
          else params.delete("tri");
          router.push(`/voitures${params.size ? `?${params}` : ""}`, { scroll: false });
        }}
        className="rounded-lg border border-black/15 bg-white px-2.5 py-2 font-semibold"
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}
