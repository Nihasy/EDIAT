import type { Metadata } from "next";
import { ClockIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { LeadForm } from "@/components/site/LeadForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { siteSettings } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";
import { displayPhone, telLink, waLink } from "@/lib/format";

export const metadata: Metadata = pageMeta({
  title: "Contact & showroom à Antananarivo",
  description: "Contactez Ediat Garage à Antananarivo : visite du showroom, essai d'une voiture d'occasion, financement, import sur commande. Réponse rapide par WhatsApp.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await siteSettings();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Contact & showroom</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Une question, un essai, une visite du showroom ? Écrivez-nous ou passez nous voir.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card p-5 sm:p-7">
          <LeadForm
            kind="contact"
            extra={[{ name: "sujet", label: "Sujet", options: ["Visite du showroom", "Essai d'un véhicule", "Financement", "Import sur commande", "Autre"] }]}
            whatsapp={settings.whatsapp}
            whatsappText="Bonjour Ediat Garage, je viens de vous envoyer un message depuis le site."
          />
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <h2 className="font-display text-2xl font-semibold">Ediat Garage</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/85 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_li]:items-center">
              <li className="flex gap-3"><PinIcon className="h-5 w-5 shrink-0 text-orange" /> <span className="whitespace-pre-line">{settings.address}</span></li>
              <li className="flex gap-3"><PhoneIcon className="h-5 w-5 shrink-0 text-orange" /> <a href={telLink(settings.phone)} className="hover:text-white">{displayPhone(settings.phone)}</a></li>
              <li className="flex gap-3"><ClockIcon className="h-5 w-5 shrink-0 text-orange" /> <span className="whitespace-pre-line">{settings.hours}</span></li>
              {settings.email && <li className="flex gap-3"><span className="w-5 text-center text-orange">@</span> <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li>}
            </ul>
            <div className="mt-6 grid gap-2">
              <a href={waLink(settings.whatsapp, "Bonjour Ediat Garage !")} target="_blank" rel="noopener" className="btn-whatsapp"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
              {settings.mapsUrl && <a href={settings.mapsUrl} target="_blank" rel="noopener" className="btn border border-white/25 text-white hover:border-white">Itinéraire</a>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
