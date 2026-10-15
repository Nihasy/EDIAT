import Link from "next/link";
import { ArrowRightIcon } from "../Icons";

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
    <section aria-labelledby={id} className="reveal mx-auto max-w-7xl py-7 sm:py-10">
      <div className="mb-2 flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          {kicker && (
            <p className={`flex items-center gap-2 truncate text-[11px] font-bold tracking-[0.2em] uppercase ${dark ? "text-cyan-light" : "text-cyan-deep"}`}>
              <span className="h-0.5 w-5 shrink-0 bg-orange" aria-hidden="true" /> {kicker}
            </p>
          )}
          <h2 id={id} className={`font-display mt-1 truncate text-[28px] leading-none font-bold sm:text-4xl ${dark ? "text-white" : ""}`}>
            {title}{" "}
            {count != null && <span className={`align-top text-base font-semibold tabular-nums ${dark ? "text-white/60" : "text-muted"}`}>{count}</span>}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className={`group/all inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${
              dark ? "text-white ring-1 ring-white/25 hover:bg-white hover:text-ink" : "bg-white text-orange-deep ring-1 ring-black/10 hover:bg-orange-deep hover:text-white hover:ring-orange-deep"
            }`}
          >
            Tout voir <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-(--ease-out) group-hover/all:translate-x-0.5" />
          </Link>
        )}
      </div>
      {/* pt/pb leave room for the card lift and shadow inside the scroller. */}
      <ul className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-2 pb-4 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {children.map((child, i) => (
          // Large screens show one full row (4 then 5 columns): no lone card on a second row.
          <li key={i} className={`w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[31%] lg:w-auto ${i === 4 ? "lg:hidden xl:block" : i > 4 ? "lg:hidden" : ""}`}>
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}
