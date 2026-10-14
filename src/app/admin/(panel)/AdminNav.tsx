"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/vehicules", label: "Véhicules" },
  { href: "/admin/demandes", label: "Demandes" },
  { href: "/admin/parametres", label: "Paramètres" },
];

// One scrollable row on mobile, current section highlighted.
export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Back-office" className="order-last flex w-full gap-1 overflow-x-auto text-sm font-medium [scrollbar-width:none] md:order-none md:w-auto md:flex-1 [&::-webkit-scrollbar]:hidden">
      {ITEMS.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 whitespace-nowrap transition ${active ? "bg-orange-deep text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
          >
            {it.label}
            {it.href === "/admin/demandes" && newLeads > 0 && (
              <span className="rounded-full bg-cyan px-1.5 text-xs font-bold text-ink" aria-label={`${newLeads} nouvelles`}>{newLeads}</span>
            )}
          </Link>
        );
      })}
      <Link href="/" target="_blank" className="shrink-0 rounded-full px-3 py-2 whitespace-nowrap text-white/50 hover:text-white">
        Voir le site ↗
      </Link>
    </nav>
  );
}
