import Link from "next/link";
import { fromMonthly, type FinanceSettings } from "@/lib/finance";
import { formatAr, formatKm } from "@/lib/format";
import { thumbUrl } from "@/lib/images";
import { isNew, vehicleHref, vehicleTitle, type Vehicle } from "@/lib/vehicle";
import { CalendarIcon, CameraIcon, FuelIcon, GaugeIcon, GearIcon } from "./Icons";
import { StatusBadge } from "./StatusBadge";
import { Img } from "./ui/Img";

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
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="bg-brand-gradient relative aspect-[4/3] overflow-hidden">
        {photo ? (
          <Img
            src={thumbUrl(photo)}
            fallback={photo}
            alt={`${vehicleTitle(v)} ${v.year ?? ""}`}
            loading={priority ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${closed ? "grayscale-[60%]" : ""}`}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/brand/eg-mark.png" alt="" className="absolute inset-0 m-auto h-1/2 opacity-30" />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <StatusBadge status={v.status} />
          {v.featured && !closed && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-orange-deep">★ Coup de cœur</span>}
          {isNew(v) && !closed && !v.featured && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-cyan-deep">Nouveau</span>}
        </div>
        {v.images.length > 1 && (
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            <CameraIcon className="h-3.5 w-3.5" /> {v.images.length}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl leading-tight font-semibold">
          <Link href={vehicleHref(v)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {vehicleTitle(v)}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 min-h-5 text-sm text-muted">{v.version || v.engine || " "}</p>

        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px] text-black/75">
          {v.year && <li className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-cyan-deep" />{v.year}</li>}
          {v.mileageKm != null && <li className="flex items-center gap-1.5"><GaugeIcon className="h-4 w-4 text-cyan-deep" />{formatKm(v.mileageKm)}</li>}
          {v.fuel && <li className="flex items-center gap-1.5"><FuelIcon className="h-4 w-4 text-cyan-deep" />{v.fuel}</li>}
          {v.gearbox && <li className="flex items-center gap-1.5"><GearIcon className="h-4 w-4 text-cyan-deep" />{v.gearbox}</li>}
        </ul>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2 border-t border-black/10 pt-3">
            <div>
              {v.oldPrice && v.price && v.oldPrice > v.price && (
                <p className="text-xs text-muted line-through">{formatAr(v.oldPrice)}</p>
              )}
              <p className="font-display text-2xl font-bold text-ink">{v.price ? formatAr(v.price) : "Prix sur demande"}</p>
            </div>
            {v.status === "sur_commande" && <p className="text-right text-xs text-muted">Délai<br /><span className="font-semibold text-ink">{v.eta || orderDelay}</span></p>}
            {v.status === "arrivage" && v.eta && <p className="text-right text-xs text-muted">Arrivée<br /><span className="font-semibold text-ink">{v.eta}</span></p>}
          </div>
          {monthly && !closed && (
            <p className="bg-orange-gradient mt-3 rounded-full px-4 py-1.5 text-center text-sm text-white">
              à partir de <span className="font-bold">{formatAr(monthly)}</span> / mois
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
