import Link from "next/link";

// A row of vehicles: swipeable on phones and tablets (2.2 / 3.2 cards in
// view, like the marketplace apps), a plain grid on large screens.
export function Rail({
  title,
  kicker,
  href,
  count,
  children,
  id,
  dark = false,
}: {
  title: string;
  kicker?: string;
  href?: string;
  count?: number;
  children: React.ReactNode[];
  id: string;
  dark?: boolean;
}) {
  return (
    <section aria-labelledby={id} className="mx-auto max-w-7xl py-6 sm:py-8">
      <div className="mb-3 flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          {kicker && <p className={`truncate text-[11px] font-bold tracking-[0.18em] uppercase ${dark ? "text-cyan" : "text-cyan-deep"}`}>{kicker}</p>}
          <h2 id={id} className={`font-display truncate text-2xl font-bold sm:text-3xl ${dark ? "text-white" : ""}`}>
            {title} {count != null && <span className={`text-lg font-semibold ${dark ? "text-white/60" : "text-muted"}`}>{count}</span>}
          </h2>
        </div>
        {href && (
          <Link href={href} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-orange-deep ring-1 ring-black/10 hover:ring-orange-deep">
            Tout voir →
          </Link>
        )}
      </div>
      <ul className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {children.map((child, i) => (
          <li key={i} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[31%] lg:w-auto">
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}
