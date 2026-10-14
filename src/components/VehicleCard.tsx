import Link from "next/link";
import { fromMonthly, type FinanceSettings } from "@/lib/finance";
import { formatAr, formatNumber } from "@/lib/format";
import { thumbUrl } from "@/lib/images";
import { isNew, STATUSES, vehicleHref, vehicleTitle, type Vehicle } from "@/lib/vehicle";
import { CameraIcon } from "./Icons";
import { StatusBadge } from "./StatusBadge";
import { Img } from "./ui/Img";

// Photo-first card: the picture takes most of the space, the text is reduced
// to what people compare (model, year, km, price, monthly payment).
export function VehicleCard({
  v,
  finance,
  orderDelay,
  priority = false,
}: {
  v: Vehicle;
  finance: FinanceSettings;
  orderDelay: string;
  priority?: boolean;
}) {
  const monthly = fromMonthly(v, finance);
  const closed = v.status === "vendu" || v.status === "reserve";
  const photo = v.images[0];
  const facts = [v.year, v.mileageKm != null ? `${formatNumber(v.mileageKm)} km` : null, v.fuel, v.gearbox === "Automatique" ? "Auto" : v.gearbox].filter(Boolean);
  const delay = v.status === "sur_commande" ? v.eta || orderDelay : v.status === "arrivage" ? v.eta : "";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition hover:shadow-lg sm:rounded-2xl">
      <div className="bg-brand-gradient relative aspect-[4/3] overflow-hidden">
        {photo ? (
          <Img
            src={thumbUrl(photo)}
            fallback={photo}
            alt={`${vehicleTitle(v)} ${v.year ?? ""}`}
            loading={priority ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] ${closed ? "grayscale-[70%]" : ""}`}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/brand/eg-mark.png" alt="" className="absolute inset-0 m-auto h-1/2 opacity-30" />
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <StatusBadge status={v.status} small />
          {v.featured && !closed && <span className="rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-orange-deep sm:text-[11px]">★</span>}
          {isNew(v) && !closed && !v.featured && <span className="hidden rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-cyan-deep sm:inline">Nouveau</span>}
        </div>
        {v.images.length > 1 && (
          <span className={`absolute right-2 bottom-2 items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white ${delay ? "hidden sm:inline-flex" : "inline-flex"}`}>
            <CameraIcon className="h-3 w-3" /> {v.images.length}
          </span>
        )}
        {delay && (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">
            <span aria-hidden="true">⏱ </span><span className="sr-only">{v.status === "arrivage" ? "Arrivée prévue : " : "Délai : "}</span>{delay}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        <h3 className="truncate text-[14px] leading-tight font-bold sm:text-base">
          <Link href={vehicleHref(v)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {vehicleTitle(v)}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-[12px] text-muted sm:text-[13px]">{facts.join(" · ") || v.version}</p>
        <div className="mt-auto pt-2">
          {v.oldPrice && v.price && v.oldPrice > v.price && (
            <p className="text-[11px] text-muted line-through">{formatAr(v.oldPrice)}</p>
          )}
          <p className={`font-display text-[17px] leading-tight font-bold sm:text-xl ${closed ? "text-black/45" : "text-ink"}`}>
            {closed ? STATUSES[v.status].short : v.price ? formatAr(v.price) : "Sur demande"}
          </p>
          {monthly && !closed && (
            <p className="mt-0.5 truncate text-[12px] font-semibold text-orange-deep sm:text-[13px]">
              dès {formatAr(monthly)}<span className="font-normal text-muted">/mois</span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
