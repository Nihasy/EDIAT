import Link from "next/link";

// EG mark (from the official logo) + "EDIAT GARAGE" wordmark.
export function Logo({ href = "/", dark = true, className = "" }: { href?: string; dark?: boolean; className?: string }) {
  return (
    <Link href={href} aria-label="Ediat Garage — accueil" className={`flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/eg-mark.png" alt="" width={639} height={818} className="h-10 w-auto drop-shadow-sm" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[22px] font-bold tracking-wide ${dark ? "text-white" : "text-ink"}`}>Ediat</span>
        <span className={`font-display text-[11px] font-semibold tracking-[0.32em] ${dark ? "text-cyan-light" : "text-cyan-deep"}`}>Garage</span>
      </span>
    </Link>
  );
}
