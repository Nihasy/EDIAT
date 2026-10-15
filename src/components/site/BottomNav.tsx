"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavorites } from "@/lib/favorites";
import { CarIcon, HeartIcon, HomeIcon, MailIcon, WalletIcon } from "../Icons";
import { WhatsAppIcon } from "../WhatsAppIcon";

// App-style tab bar on phones and tablets: the main destinations stay under
// the thumb. Hidden on vehicle pages, which have their own action bar.
export function BottomNav({ whatsappHref, financeName }: { whatsappHref: string; financeName: string | null }) {
  const pathname = usePathname();
  const { ids } = useFavorites();
  if (/^\/voitures\/[^/]+$/.test(pathname)) return null;
  const items = [
    { href: "/", label: "Accueil", icon: <HomeIcon className="h-6 w-6" />, active: pathname === "/" },
    { href: "/voitures", label: "Véhicules", icon: <CarIcon className="h-6 w-6" />, active: pathname.startsWith("/voitures") },
    { href: "/favoris", label: "Favoris", icon: <HeartIcon className="h-6 w-6" filled={pathname === "/favoris"} />, active: pathname === "/favoris", count: ids.length },
    financeName
      ? { href: "/financement", label: financeName.replace(/^Ediat\s+/i, "") || "Financement", icon: <WalletIcon className="h-6 w-6" />, active: pathname === "/financement" }
      : { href: "/contact", label: "Contact", icon: <MailIcon className="h-6 w-6" />, active: pathname === "/contact" },
  ];
  return (
    <nav
      aria-label="Navigation rapide"
      style={{ viewTransitionName: "tab-bar" }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors duration-200 ${it.active ? "text-orange-deep" : "text-black/60 hover:text-ink"}`}
            >
              {it.active && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-orange" aria-hidden="true" />}
              {it.icon}
              {it.label}
              {!!it.count && (
                <span className="absolute top-2 left-1/2 ml-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {it.count}
                </span>
              )}
            </Link>
          </li>
        ))}
        <li>
          <a href={whatsappHref} target="_blank" rel="noopener" className="flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-[#15803d]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shadow">
              <WhatsAppIcon className="h-[18px] w-[18px]" />
            </span>
            WhatsApp
          </a>
        </li>
      </ul>
    </nav>
  );
}
