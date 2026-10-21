"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { STATUSES, type VehicleStatus } from "@/lib/vehicle";
import { ChevronLeftIcon, ChevronRightIcon } from "../Icons";
import { LinkPendingOverlay } from "../LinkPendingOverlay";
import { StatusBadge } from "../StatusBadge";
import { PhotoBackdrop } from "../ui/PhotoBackdrop";

export type Slide = {
  href: string;
  image: string;
  title: string;
  subtitle: string;
  price: string;
  monthly: string | null;
  status: VehicleStatus;
};

// Full-bleed photo banner of the vehicles to push (coup de cœur first), under
// the transparent header of the home page. Swipe, arrows and dots; the active
// dot fills up and moves to the next slide when full, unless the visitor
// touches the banner or prefers reduced motion.
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  // Furthest slide reached: photos load one slide ahead, not all six at once
  // (each is a full-size photo, a lot of data on a phone connection).
  const [reached, setReached] = useState(0);
  const count = slides.length;
  if (active > reached) setReached(active);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Decided after hydration: the server does not know the motion preference.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAutoplay(count > 1 && !media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [count]);

  // No point turning slides nobody sees (tab in the background).
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: ((i + count) % count) * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  }

  const arrow =
    "absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm transition-colors duration-200 hover:bg-white hover:text-ink md:flex";

  return (
    <section
      data-hero-overlay
      aria-roledescription="carrousel"
      aria-label="Véhicules à la une"
      data-paused={paused}
      className="group relative -mt-[67px] bg-ink lg:-mt-[75px]"
      onPointerDown={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div ref={track} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slides.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            data-active={i === active}
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${count} : ${s.title}, ${s.price}`}
            className="shimmer-dark relative block h-[74svh] min-h-[460px] w-full shrink-0 snap-center overflow-hidden sm:h-auto sm:min-h-0 sm:aspect-[16/9] lg:aspect-auto lg:h-[88svh] lg:max-h-[900px] lg:min-h-[560px] short:aspect-auto short:h-[calc(100svh-4.5rem)] short:min-h-[260px] lg:short:h-svh"
          >
            {i <= reached + 1 && <HeroPhoto src={s.image} eager={i === 0} />}
            <LinkPendingOverlay />
            {/* Top shade for the header, bottom shade for the text. */}
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent lg:bg-gradient-to-r lg:from-black/85 lg:via-black/35 lg:to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-col items-start px-4 pb-16 text-white sm:pb-28 md:px-20 lg:top-0 min-[1400px]:px-4 short:pb-14 lg:short:top-auto lg:justify-center lg:pb-0">
              <StatusBadge status={s.status} className="hero-in" />
              <p className="hero-in font-display mt-3 max-w-3xl text-[40px] leading-[0.95] font-bold text-balance sm:text-6xl lg:text-7xl short:text-4xl">{s.title}</p>
              <p className="hero-in mt-2 text-sm text-white/85 sm:text-base">{s.subtitle}</p>
              <div className="hero-in mt-4 flex flex-wrap items-center gap-3">
                <span className="font-display text-3xl font-bold tabular-nums sm:text-4xl">{s.price}</span>
                {s.monthly && (
                  <span className="rounded-full bg-orange-deep px-3 py-1.5 text-sm text-white">
                    dès <strong>{s.monthly}</strong>/mois
                  </span>
                )}
              </div>
              <span className="hero-in mt-6 hidden items-center short:hidden! gap-2 rounded-full bg-orange-deep px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-[#9c360b] lg:inline-flex">
                {s.status === "showroom" ? "Voir le véhicule" : STATUSES[s.status].short}
                <ChevronRightIcon className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {count > 1 && (
        <>
          <button type="button" onClick={() => go(active - 1)} aria-label="Précédent" className={`${arrow} left-4`}>
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Suivant" className={`${arrow} right-4`}>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-5 mx-auto flex max-w-7xl px-3 sm:bottom-16 short:bottom-2">
            {slides.map((s, i) => (
              <button
                key={s.href}
                type="button"
                onClick={() => go(i)}
                aria-label={`Diapositive ${i + 1} : ${s.title}`}
                aria-current={i === active}
                className="flex h-11 flex-1 items-center px-1 sm:max-w-16"
              >
                <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/30">
                  {i < active && <span className="absolute inset-0 bg-white" />}
                  {i === active &&
                    (autoplay ? (
                      <span key={active} className="hero-progress absolute inset-0 bg-orange" onAnimationEnd={() => go(active + 1)} />
                    ) : (
                      <span className="absolute inset-0 bg-orange" />
                    ))}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// Landscape photos fill the banner. An upright photo (phone shot) would be
// cropped to a close-up in a wide banner: from tablets up it shows whole, on
// the right, over a blurred copy of itself; on phones the banner is tall
// enough to fill.
function HeroPhoto({ src, eager }: { src: string; eager: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [upright, setUpright] = useState(false);
  const measure = (img: HTMLImageElement) => setUpright(img.naturalHeight > img.naturalWidth * 1.05);

  // Loaded before hydration: the load event was missed.
  useEffect(() => {
    const img = ref.current;
    if (!img?.complete || !img.naturalWidth) return;
    const frame = requestAnimationFrame(() => measure(img));
    return () => cancelAnimationFrame(frame);
  }, [src]);

  return (
    <>
      {upright && <PhotoBackdrop src={src} className="hidden sm:block" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt=""
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        onLoad={(e) => measure(e.currentTarget)}
        className={`hero-photo absolute inset-0 h-full w-full object-cover ${upright ? "sm:left-auto sm:w-auto sm:max-w-[60%] sm:object-contain sm:[mask-image:linear-gradient(to_right,transparent,black_22%)] lg:right-[4%]" : ""}`}
      />
    </>
  );
}
