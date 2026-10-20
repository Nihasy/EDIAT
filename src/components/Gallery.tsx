"use client";

import { useEffect, useRef, useState, ViewTransition } from "react";
import { thumbUrl } from "@/lib/images";
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon } from "./Icons";
import { Lightbox } from "./Lightbox";
import { PhotoBackdrop } from "./ui/PhotoBackdrop";
import { Img } from "./ui/Img";
import { Watermark } from "./ui/Watermark";

// Vehicle photo gallery: swipe (native scroll-snap), see-through arrows, dots,
// a watermark on each photo, keyboard arrows and light thumbnails. Only the first photo loads
// eagerly; the others load as they come into view.
// `morphName`: the first photo shares this view-transition name with the
// vehicle card, so the card photo flies into place on navigation.
export function Gallery({ images, alt, overlay, morphName }: { images: string[]; alt: string; overlay?: React.ReactNode; morphName?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  // Photo we are animating to: while set, intermediate scroll positions are
  // ignored (no flickering dots, and arrows pressed mid-animation start
  // from the photo being shown, not from one passed on the way).
  const target = useRef<number | null>(null);
  const count = images.length;

  // Follow the scroll position (swipe, arrows, thumbnails all scroll the track).
  useEffect(() => {
    const el = track.current;
    if (!el || count < 2) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth);
        if (target.current !== null) {
          if (i === target.current) target.current = null;
          return;
        }
        setActive(i);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const next = (i + count) % count;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Already there: no scroll event will come to clear the target.
    target.current = Math.round(el.scrollLeft / el.clientWidth) === next ? null : next;
    el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setActive(next);
  }
  // Swipe by hand: forget any pending programmatic target.
  const release = () => {
    target.current = null;
  };

  if (!count) {
    return (
      <div className="bg-brand-gradient flex aspect-[4/3] items-center justify-center md:rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/eg-mark.png" alt="" className="h-1/2 opacity-40" />
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label={`Photos de ${alt}`}
      onKeyDown={(e) => {
        if (count < 2) return;
        if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
      }}
    >
      <div className="group relative">
        <div
          ref={track}
          tabIndex={0}
          onPointerDown={release}
          onTouchStart={release}
          onWheel={release}
          aria-label="Photos du véhicule, utilisez les flèches pour naviguer"
          className="shimmer flex aspect-[4/3] max-h-[72svh] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden md:rounded-2xl [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div
              key={src}
              onClick={() => setViewer(i)}
              className="relative h-full w-full shrink-0 cursor-zoom-in snap-center overflow-hidden bg-ink"
              role="group"
              aria-roledescription="photo"
              aria-label={`${i + 1} sur ${count}`}
            >
              {/* Whole photo, never cropped (phone shots are often upright): the
                  gaps are filled with a blurred copy of the photo. */}
              <PhotoBackdrop src={thumbUrl(src)} />
              {i === 0 && morphName ? (
                <ViewTransition name={morphName} share="morph" default="none">
                  <div className="relative h-full w-full">
                    {/* The card thumbnail (already in the browser cache) shows
                        at once; the full photo fades in over it. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbUrl(src)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain" />
                    <Img src={src} alt={alt} loading="eager" fetchPriority="high" draggable={false} className="relative h-full w-full object-contain" />
                  </div>
                </ViewTransition>
              ) : (
                <Img
                  src={src}
                  alt={i === 0 ? alt : `${alt}, photo ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  draggable={false}
                  className="relative h-full w-full object-contain"
                />
              )}
              <Watermark />
            </div>
          ))}
        </div>

        {overlay}
        <button
          type="button"
          onClick={() => setViewer(active)}
          className="absolute right-3 bottom-3 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-black/60 px-3.5 text-sm font-semibold text-white backdrop-blur transition-colors duration-200 hover:bg-black/80"
        >
          <ExpandIcon className="h-4 w-4" /> Agrandir
        </button>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Photo précédente"
              className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-xl text-white ring-1 ring-white/25 backdrop-blur-[2px] transition hover:bg-black/40 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Photo suivante"
              className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-xl text-white ring-1 ring-white/25 backdrop-blur-[2px] transition hover:bg-black/40 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-0 bottom-5 flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
              {images.map((src, i) => (
                <span key={src} className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {viewer !== null && (
        <Lightbox
          images={images}
          alt={alt}
          start={viewer}
          onClose={(i) => {
            setViewer(null);
            go(i);
          }}
        />
      )}
      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="Choisir une photo">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === active}
              className={`shimmer aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border-2 transition sm:w-24 ${i === active ? "border-orange" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <Img src={thumbUrl(src)} fallback={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
