"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "../WhatsAppIcon";

// Large screens only (phones and tablets have it in the bottom bar); hidden on
// vehicle pages, which have their own WhatsApp button.
export function FloatingWhatsApp({ href }: { href: string }) {
  const pathname = usePathname();
  if (/^\/voitures\/[^/]+$/.test(pathname)) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Nous écrire sur WhatsApp"
      className="fixed right-4 bottom-4 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-colors duration-200 hover:bg-[#1ebe5b] lg:flex"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
