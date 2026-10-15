import { isNew, type Vehicle } from "@/lib/vehicle";
import { ArrowDownIcon, GaugeIcon, SparkIcon, StarIcon } from "./Icons";

// Selling points worth a badge, most convincing first.
export function sellingPoints(v: Vehicle) {
  const out: { key: string; label: string; icon: React.ReactNode; cls: string }[] = [];
  const closed = v.status === "vendu" || v.status === "reserve";
  if (closed) return out;
  if (v.oldPrice && v.price && v.oldPrice > v.price) {
    out.push({ key: "baisse", label: `-${Math.round(((v.oldPrice - v.price) / v.oldPrice) * 100)} %`, icon: <ArrowDownIcon />, cls: "bg-red-600 text-white" });
  }
  if (v.featured) out.push({ key: "coeur", label: "Coup de cœur", icon: <StarIcon />, cls: "bg-white text-orange-deep" });
  if (isNew(v)) out.push({ key: "nouveau", label: "Nouveau", icon: <SparkIcon />, cls: "bg-white text-cyan-deep" });
  if (v.mileageKm != null && v.mileageKm < 60_000) out.push({ key: "km", label: "Faible km", icon: <GaugeIcon />, cls: "bg-white text-emerald-700" });
  return out;
}

export function VehicleBadges({ v, max = 2, size = "sm", className = "" }: { v: Vehicle; max?: number; size?: "sm" | "md"; className?: string }) {
  const points = sellingPoints(v).slice(0, max);
  if (!points.length) return null;
  return (
    <span className={`flex flex-wrap gap-1 ${className}`}>
      {points.map((p) => (
        <span
          key={p.key}
          className={`inline-flex items-center gap-1 rounded-md font-bold shadow-sm ring-1 ring-black/5 ${size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"} ${p.cls}`}
        >
          <span className={`[&>svg]:h-full [&>svg]:w-full ${size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}`}>{p.icon}</span>
          {p.label}
        </span>
      ))}
    </span>
  );
}
