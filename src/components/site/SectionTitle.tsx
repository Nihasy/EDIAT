import Link from "next/link";

// Section heading in the style of the Ediat posters: condensed capitals,
// small orange rule, optional "see all" link.
export function SectionTitle({
  kicker,
  title,
  link,
  dark = false,
  id,
}: {
  kicker?: string;
  title: React.ReactNode;
  link?: { href: string; label: string };
  dark?: boolean;
  id?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && (
          <p className={`flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase ${dark ? "text-cyan-light" : "text-cyan-deep"}`}>
            <span className="h-0.5 w-6 bg-orange" aria-hidden="true" /> {kicker}
          </p>
        )}
        <h2 id={id} className={`font-display mt-1.5 text-3xl font-bold sm:text-4xl ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className={`text-sm font-semibold underline-offset-4 hover:underline ${dark ? "text-orange" : "text-orange-deep"}`}>
          {link.label} →
        </Link>
      )}
    </div>
  );
}
