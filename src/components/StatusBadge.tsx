import { STATUSES, type VehicleStatus } from "@/lib/vehicle";
import { DocIcon, KeyIcon, LockIcon, ShipIcon, TagIcon } from "./Icons";

// One badge per availability: colour + icon + word, so the status never
// relies on colour alone (and reads on top of any photo).
const STYLE: Record<VehicleStatus, { cls: string; icon: React.ReactNode }> = {
  showroom: { cls: "bg-emerald-700 text-white", icon: <KeyIcon /> },
  arrivage: { cls: "bg-cyan-deep text-white", icon: <ShipIcon /> },
  sur_commande: { cls: "bg-orange-deep text-white", icon: <DocIcon /> },
  reserve: { cls: "bg-amber-700 text-white", icon: <LockIcon /> },
  vendu: { cls: "bg-ink text-white", icon: <TagIcon /> },
  brouillon: { cls: "bg-black/60 text-white", icon: <LockIcon /> },
};

export function StatusBadge({ status, long = false, small = false, className = "" }: { status: VehicleStatus; long?: boolean; small?: boolean; className?: string }) {
  const s = STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-bold whitespace-nowrap shadow-sm ring-1 ring-white/25 ${
        small ? "max-w-[calc(100%-3.25rem)] px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-[11px]" : "px-2.5 py-1 text-xs tracking-wide"
      } ${s.cls} ${className}`}
    >
      <span className={`[&>svg]:h-full [&>svg]:w-full ${small ? "h-3 w-3" : "h-3.5 w-3.5"}`}>{s.icon}</span>
      {long ? STATUSES[status].label : STATUSES[status].short}
    </span>
  );
}
