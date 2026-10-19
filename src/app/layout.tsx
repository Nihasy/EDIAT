import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", weight: ["500", "600", "700"], subsets: ["latin"] });

const description =
  "Ediat Garage, importateur de véhicules d'occasion de Corée à Antananarivo : voitures disponibles au showroom, en arrivage ou sur commande. Paiement échelonné avec Ediat Facility.";

// Icons (favicon.ico, icon.png, apple-icon.png) and the share image
// (opengraph-image) are files next to this layout: Next.js links them.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Ediat Garage — Véhicules d'occasion importés de Corée", template: "%s · Ediat Garage" },
  description,
  applicationName: "Ediat Garage",
  appleWebApp: { title: "Ediat Garage", statusBarStyle: "black" },
  openGraph: { type: "website", locale: "fr_FR", siteName: "Ediat Garage", description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#1f2224" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${inter.variable} ${oswald.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        {/* The analytics script only exists on Vercel: elsewhere it is a 404. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
