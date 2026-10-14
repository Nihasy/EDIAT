"use client";

import { useFavorites } from "@/lib/favorites";
import { HeartIcon } from "./Icons";

// Heart toggle; 44 px touch area even when the visible circle is smaller.
export function FavoriteButton({ id, label, variant = "photo" }: { id: number; label: string; variant?: "photo" | "plain" }) {
  const fav = useFavorites();
  const on = fav.has(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Retirer ${label} des favoris` : `Ajouter ${label} aux favoris`}
      title={on ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        fav.toggle(id);
      }}
      className={
        variant === "photo"
          ? "group/fav relative z-10 flex h-11 w-11 items-center justify-center"
          : `flex h-11 w-11 shrink-0 items-center min-[380px]:h-12 min-[380px]:w-12 justify-center rounded-full border transition-colors duration-200 ${on ? "border-red-200 bg-red-50 text-red-600" : "border-black/15 bg-white text-ink hover:border-ink"}`
      }
    >
      {variant === "photo" ? (
        <span className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-colors duration-200 ${on ? "bg-red-600 text-white" : "bg-white/90 text-ink group-hover/fav:text-red-600"}`}>
          <HeartIcon filled={on} className="h-[18px] w-[18px]" />
        </span>
      ) : (
        <HeartIcon filled={on} className="h-5 w-5" />
      )}
    </button>
  );
}
