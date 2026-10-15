"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites";
import { HeartIcon } from "../Icons";

export function HeaderFavorites() {
  const { ids } = useFavorites();
  return (
    <Link
      href="/favoris"
      aria-label={`Mes favoris${ids.length ? ` (${ids.length})` : ""}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white"
    >
      <HeartIcon className="h-[22px] w-[22px]" filled={ids.length > 0} />
      {ids.length > 0 && (
        <span className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">{ids.length}</span>
      )}
    </Link>
  );
}
