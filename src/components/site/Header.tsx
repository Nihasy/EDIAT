import { displayPhone, telLink, waLink } from "@/lib/format";
import type { Settings } from "@/lib/settings-shared";
import { PhoneIcon } from "../Icons";
import { Logo } from "../Logo";
import { WhatsAppIcon } from "../WhatsAppIcon";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

export const NAV = [
  { href: "/voitures", label: "Nos véhicules" },
  { href: "/voitures?dispo=showroom", label: "Dispo au showroom" },
  { href: "/sur-commande", label: "Sur commande" },
  { href: "/financement", label: "Ediat Facility" },
  { href: "/contact", label: "Contact" },
];

export function Header({ settings }: { settings: Settings }) {
  return (
    <>
      {settings.announcement && (
        <p className="bg-orange-gradient px-4 py-2 text-center text-[13px] font-medium text-white">{settings.announcement}</p>
      )}
      <header className="sticky top-0 z-30 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:h-[72px]">
          <Logo />
          <nav aria-label="Menu principal" className="ml-auto lg:ml-8">
            <NavLinks links={NAV} />
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-auto">
            <a
              href={telLink(settings.phone)}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-white/85 hover:text-white xl:flex"
            >
              <PhoneIcon className="h-4 w-4 text-cyan" /> {displayPhone(settings.phone)}
            </a>
            <a
              href={waLink(settings.whatsapp, "Bonjour Ediat Garage, je souhaite des informations.")}
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-2 rounded-full bg-[#1da851] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#178a43] sm:flex"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <MobileMenu links={[{ href: "/", label: "Accueil" }, ...NAV]} />
          </div>
        </div>
        <div className="h-[3px] bg-[linear-gradient(90deg,var(--color-orange)_0_60%,var(--color-cyan)_60%_100%)]" aria-hidden="true" />
      </header>
    </>
  );
}
