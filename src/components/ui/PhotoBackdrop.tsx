// Blurred, darkened copy of a photo behind it, so a photo shown whole (an
// upright phone shot in a wide frame) has no empty bars around it.
export function PhotoBackdrop({ src, className = "" }: { src: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full scale-125 object-cover opacity-70 blur-2xl" />
      <span className="absolute inset-0 bg-ink/30" />
    </span>
  );
}
