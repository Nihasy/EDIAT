import { BottomNav } from "@/components/site/BottomNav";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { siteSettings } from "@/lib/catalog";
import { waLink } from "@/lib/format";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await siteSettings();
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Aller au contenu
      </a>
      <Header settings={settings} />
      <main id="contenu" className="flex-1">{children}</main>
      <Footer settings={settings} />
      {/* Room for the bottom bar (tab bar, or the action bar of vehicle pages). */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] bg-ink lg:hidden" aria-hidden="true" />
      <FloatingWhatsApp href={waLink(settings.whatsapp, "Bonjour Ediat Garage, je souhaite des informations.")} />
      <BottomNav whatsappHref={waLink(settings.whatsapp, "Bonjour Ediat Garage, je souhaite des informations.")} financeName={settings.finance.enabled ? settings.finance.name : null} />
    </>
  );
}
