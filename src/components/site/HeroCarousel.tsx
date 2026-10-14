"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { STATUSES, type VehicleStatus } from "@/lib/vehicle";
import { StatusBadge } from "../StatusBadge";

export type Slide = {
  href: string;
  image: string;
  title: string;
  subtitle: string;
  price: string;
  monthly: string | null;
  status: VehicleStatus;
};

// Full-width photo banner of the vehicles to push (coup de cœur first).
// Swipe, arrows and dots; advances on its own every 5 s unless the visitor
// touches it or prefers reduced motion.
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: ((i + count) % count) * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  }

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(active + 1), 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, count]);

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Véhicules à la une"
      className="group relative bg-ink"
      onPointerDown={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
    >
      <div ref={track} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slides.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${count} : ${s.title}, ${s.price}`}
            className="relative block aspect-[4/3] max-h-[78vh] w-full shrink-0 snap-center overflow-hidden sm:aspect-[16/9] lg:aspect-[21/8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.image}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/80 lg:via-black/30" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-9 text-white sm:pb-10 lg:top-0 lg:flex lg:flex-col lg:justify-center lg:pb-0">
              <StatusBadge status={s.status} className="self-start" />
              <p className="font-display mt-2 text-[34px] leading-none font-bold drop-shadow sm:text-5xl lg:text-6xl">{s.title}</p>
              <p className="mt-1 text-sm text-white/85 sm:text-base">{s.subtitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-display text-2xl font-bold sm:text-3xl">{s.price}</span>
                {s.monthly && (
                  <span className="bg-orange-gradient rounded-full px-3 py-1 text-sm">dès <strong>{s.monthly}</strong>/mois</span>
                )}
              </div>
              <span className="mt-4 hidden w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink lg:inline-block">
                {s.status === "showroom" ? "Voir le véhicule" : STATUSES[s.status].short} →
              </span>
            </div>
          </Link>
        ))}
      </div>
      {count > 1 && (
        <>
          <button type="button" onClick={() => go(active - 1)} aria-label="Précédent" className="absolute top-1/2 left-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl text-ink shadow md:flex">‹</button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Suivant" className="absolute top-1/2 right-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl text-ink shadow md:flex">›</button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center sm:bottom-2">
            {slides.map((s, i) => (
              <button key={s.href} type="button" onClick={() => go(i)} aria-label={`Diapositive ${i + 1}`} aria-current={i === active} className="flex h-6 items-center px-1">
                <span className={`block h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-orange" : "w-1.5 bg-white/60"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
