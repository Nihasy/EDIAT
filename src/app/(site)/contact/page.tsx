import type { Metadata } from "next";
import { ClockIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { LeadForm } from "@/components/site/LeadForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { siteSettings } from "@/lib/catalog";
import { displayPhone, telLink, waLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact & showroom",
  description: "Contactez Ediat Garage à Antananarivo : showroom, essai, reprise de votre véhicule, import sur commande.",
};

export default async function ContactPage(props: PageProps<"/contact">) {
  const sp = await props.searchParams;
  const settings = await siteSettings();
  const reprise = sp.sujet === "reprise";
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">{reprise ? "Faire reprendre votre véhicule" : "Contact & showroom"}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {reprise
          ? "Décrivez votre véhicule actuel : nous vous faisons une offre de reprise, à déduire de votre prochain achat."
          : "Une question, un essai, une visite du showroom ? Écrivez-nous ou passez nous voir."}
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card p-5 sm:p-7">
          <LeadForm
            kind={reprise ? "reprise" : "contact"}
            extra={
              reprise
                ? [{ name: "vehicule_client", label: "Votre véhicule (marque, modèle, année, km)", required: true }]
                : [{ name: "sujet", label: "Sujet", options: ["Visite du showroom", "Essai d'un véhicule", "Reprise de mon véhicule", "Financement", "Autre"] }]
            }
            hidden={reprise ? { sujet: "Reprise" } : {}}
            whatsapp={settings.whatsapp}
            whatsappText="Bonjour Ediat Garage, je viens de vous envoyer un message depuis le site."
          />
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <h2 className="font-display text-2xl font-semibold">Ediat Garage</h2>
            <ul className="mt-4 space-y-4 text-sm text-white/85">
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
