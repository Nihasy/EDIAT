import type { MetadataRoute } from "next";

// "Add to home screen" on phones: the site opens like an app, in the brand colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ediat Garage",
    short_name: "Ediat Garage",
    description: "Véhicules d'occasion importés de Corée, à Antananarivo.",
    start_url: "/",
    display: "standalone",
    background_color: "#1f2224",
    theme_color: "#1f2224",
    lang: "fr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
