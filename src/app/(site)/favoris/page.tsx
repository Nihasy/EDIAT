import type { Metadata } from "next";
import { Favorites } from "./Favorites";

export const metadata: Metadata = { title: "Mes favoris", robots: { index: false } };

export default function FavoritesPage() {
  return <Favorites />;
}
