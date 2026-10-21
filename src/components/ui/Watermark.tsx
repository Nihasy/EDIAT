// Official "Ediat Garage" wordmark in the bottom-left corner of vehicle photos.
// Drawn over the photo (not burned in), never catches clicks or swipes.
export function Watermark({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-[1] flex opacity-90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] select-none ${lg ? "bottom-3 left-3 sm:bottom-4 sm:left-4" : "bottom-3 left-3"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/ediat-logo-dark.webp" alt="" draggable={false} width={480} height={206} className={lg ? "h-9 w-auto sm:h-12" : "h-8 w-auto sm:h-9"} />
    </span>
  );
}
