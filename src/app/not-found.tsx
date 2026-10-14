import Link from "next/link";
import { connection } from "next/server";
import { BottomNav } from "@/components/site/BottomNav";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { siteSettings } from "@/lib/catalog";
import { waLink } from "@/lib/format";

// Unknown addresses: same header, footer and tab bar as the rest of the site,
// so the visitor can carry on browsing.
export default async function NotFound() {
  await connection();
  const settings = await siteSettings();
  const wa = waLink(settings.whatsapp, "Bonjour Ediat Garage, je souhaite des informations.");
  return (
    <>
      <Header settings={settings} />
      <main id="contenu" className="mx-auto max-w-xl flex-1 px-4 py-20 text-center">
        <p className="font-display text-7xl font-bold text-orange-deep">404</p>
        <h1 className="font-display mt-2 text-3xl font-semibold">Cette page n&apos;existe pas</h1>
        <p className="mt-3 text-muted">Le lien est peut-être ancien, ou le véhicule a déjà trouvé preneur.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/voitures" className="btn-primary">Voir nos véhicules</Link>
          <Link href="/" className="btn-ghost">Accueil</Link>
        </div>
      </main>
      <Footer settings={settings} />
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] bg-ink lg:hidden" aria-hidden="true" />
      <BottomNav whatsappHref={wa} financeName={settings.finance.enabled ? settings.finance.name : null} />
    </>
  );
}
