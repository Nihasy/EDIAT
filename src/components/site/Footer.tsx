import Link from "next/link";
import { displayPhone, telLink, waLink } from "@/lib/format";
import type { Settings } from "@/lib/settings-shared";
import { FEATURED_BRANDS } from "@/lib/vehicle";
import { ClockIcon, PhoneIcon, PinIcon } from "../Icons";
import { Logo } from "../Logo";
import { SocialLinks } from "../SocialLinks";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-auto bg-ink text-white/75">
      <div className="h-[3px] bg-[linear-gradient(90deg,var(--color-orange)_0_60%,var(--color-cyan)_60%_100%)]" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm leading-relaxed">
            Importateur de véhicules d&apos;occasion de Corée. Disponibles au showroom, en arrivage ou importés sur commande.
          </p>
          <div className="mt-5">
            <SocialLinks
              facebookUrl={settings.facebookUrl}
              instagramUrl={settings.instagramUrl}
              tiktokUrl={settings.tiktokUrl}
              whatsappHref={waLink(settings.whatsapp)}
            />
          </div>
        </div>
        <div>
          <h2 className="font-display text-base tracking-wide text-white">Véhicules</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/voitures?dispo=showroom" className="hover:text-white">Disponibles au showroom</Link></li>
            <li><Link href="/voitures?dispo=arrivage" className="hover:text-white">En cours d&apos;arrivage</Link></li>
            <li><Link href="/voitures?dispo=sur_commande" className="hover:text-white">Catalogue sur commande</Link></li>
            {FEATURED_BRANDS.map((b) => (
              <li key={b}><Link href={`/voitures?marque=${encodeURIComponent(b)}`} className="hover:text-white">{b} d&apos;occasion</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-base tracking-wide text-white">Services</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/sur-commande" className="hover:text-white">Import sur commande</Link></li>
            <li><Link href="/financement" className="hover:text-white">{settings.finance.name} : payez à votre rythme</Link></li>
            <li><Link href="/contact?sujet=reprise" className="hover:text-white">Reprise de votre véhicule</Link></li>
            <li><Link href="/contact" className="hover:text-white">Prendre rendez-vous</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-base tracking-wide text-white">Showroom</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex gap-2">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
              {settings.mapsUrl ? (
                <a href={settings.mapsUrl} target="_blank" rel="noopener" className="hover:text-white">{settings.address}</a>
              ) : (
                <span>{settings.address}</span>
              )}
            </li>
            <li className="flex gap-2">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
              <a href={telLink(settings.phone)} className="hover:text-white">{displayPhone(settings.phone)}</a>
            </li>
            <li className="flex gap-2">
              <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
              <span className="whitespace-pre-line">{settings.hours}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Ediat Garage — Antananarivo, Madagascar</p>
          <p>Prix en Ariary, TTC. Photos et informations non contractuelles.</p>
        </div>
      </div>
    </footer>
  );
}
