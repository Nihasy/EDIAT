import { STATUSES, type VehicleStatus } from "@/lib/vehicle";

const TONES = {
  green: "bg-emerald-600 text-white",
  cyan: "bg-cyan-deep text-white",
  orange: "bg-orange-deep text-white",
  grey: "bg-ink/85 text-white",
} as const;

export function StatusBadge({ status, long = false, small = false, className = "" }: { status: VehicleStatus; long?: boolean; small?: boolean; className?: string }) {
  const s = STATUSES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide ${small ? "px-2 py-0.5 text-[10px] sm:text-[11px]" : "px-2.5 py-1 text-xs"} ${TONES[s.tone]} ${className}`}>
      {status === "showroom" && <span className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" aria-hidden="true" />}
      {long ? s.label : s.short}
    </span>
  );
}
