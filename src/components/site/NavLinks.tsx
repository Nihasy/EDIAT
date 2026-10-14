"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {links.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href.split("?")[0]) && !l.href.includes("?");
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className="font-display relative rounded-full px-3 py-2 text-[15px] tracking-wide text-white/85 transition hover:text-white aria-[current=page]:text-orange"
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
