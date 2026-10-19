"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { thumbUrl } from "@/lib/images";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./Icons";
import { useDialog } from "./useDialog";

// Full-screen photo viewer: black background, swipe or arrows, counter,
// thumbnails, Escape to close. Opens on the photo that was tapped.
export function Lightbox({ images, alt, start, onClose }: { images: string[]; alt: string; start: number; onClose: (index: number) => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(start);
  const count = images.length;
  useDialog(dialog, true, () => onClose(active));

  useEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = start * el.clientWidth;
  }, [start]);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return createPortal(
    <div ref={dialog} role="dialog" aria-modal="true" aria-label={`Photos de ${alt}`} className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tabular-nums" aria-live="polite">{active + 1} / {count}</span>
        <button type="button" onClick={() => onClose(active)} aria-label="Fermer" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><CloseIcon className="h-6 w-6" /></button>
      </div>
      <div className="relative min-h-0 flex-1">
        <div ref={track} className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <div key={src} className="flex h-full w-full shrink-0 snap-center items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${alt}, photo ${i + 1}`} loading={Math.abs(i - start) <= 1 ? "eager" : "lazy"} className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </div>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(active - 1)} aria-label="Photo précédente" className="absolute top-1/2 left-3 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl hover:bg-white/30 md:flex"><ChevronLeftIcon className="h-6 w-6" /></button>
            <button type="button" onClick={() => go(active + 1)} aria-label="Photo suivante" className="absolute top-1/2 right-3 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl hover:bg-white/30 md:flex"><ChevronRightIcon className="h-6 w-6" /></button>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => go(i)} aria-label={`Photo ${i + 1}`} aria-current={i === active} className={`aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-md border-2 transition-opacity duration-200 ${i === active ? "border-orange opacity-100" : "border-transparent opacity-50 hover:opacity-90"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbUrl(src)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
