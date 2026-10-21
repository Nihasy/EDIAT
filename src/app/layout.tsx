import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { HOME_TITLE, SITE_DESCRIPTION } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", weight: ["500", "600", "700"], subsets: ["latin"] });

// Icons (favicon.ico, icon.png, apple-icon.png) and the share image
// (opengraph-image) are files next to this layout: Next.js links them.
// Search Console: set GOOGLE_SITE_VERIFICATION to the code of the HTML tag method.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: HOME_TITLE, template: "%s · Ediat Garage" },
  description: SITE_DESCRIPTION,
  applicationName: "Ediat Garage",
  appleWebApp: { title: "Ediat Garage", statusBarStyle: "black" },
  openGraph: { type: "website", locale: "fr_FR", siteName: "Ediat Garage" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  formatDetection: { telephone: false },
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
