import Link from "next/link";

// Official "Ediat Garage" wordmark (LOGO/LOGO.jpeg, upscaled ×4, background removed).
// On dark backgrounds a thin white outline keeps the dark red "Garage" readable.
export function Logo({ href = "/", dark = true, className = "" }: { href?: string; dark?: boolean; className?: string }) {
  return (
    <Link href={href} aria-label="Ediat Garage — accueil" className={`flex min-h-11 items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dark ? "/brand/ediat-logo-dark.webp" : "/brand/ediat-logo.webp"}
        alt="Ediat Garage"
        width={480}
        height={dark ? 206 : 201}
        fetchPriority="high"
        className="h-12 w-auto sm:h-14"
      />
    </Link>
  );
}
