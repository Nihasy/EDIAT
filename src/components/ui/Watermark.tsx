// "EG Ediat Garage" mark in the bottom-left corner of vehicle photos. Drawn
// over the photo (not burned in), never catches clicks or swipes.
export function Watermark({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-[1] flex items-center gap-1.5 opacity-85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] select-none ${lg ? "bottom-3 left-3 sm:bottom-4 sm:left-4" : "bottom-3 left-3"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/eg-mark.png" alt="" draggable={false} className={lg ? "h-7 w-auto sm:h-9" : "h-6 w-auto sm:h-7"} />
      <span className={`font-display leading-none font-bold tracking-wide text-white uppercase ${lg ? "text-sm sm:text-lg" : "text-[13px] sm:text-sm"}`}>Ediat Garage</span>
    </span>
  );
}
