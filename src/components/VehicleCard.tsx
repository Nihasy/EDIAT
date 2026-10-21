import Link from "next/link";
import { ViewTransition } from "react";
import { fromMonthly, type FinanceSettings } from "@/lib/finance";
import { formatAr, formatNumber } from "@/lib/format";
import { thumbUrl } from "@/lib/images";
import { STATUSES, vehicleHref, vehicleTitle, type Vehicle } from "@/lib/vehicle";
import { FavoriteButton } from "./FavoriteButton";
import { CameraIcon, ClockIcon } from "./Icons";
import { LinkPendingOverlay } from "./LinkPendingOverlay";
import { StatusBadge } from "./StatusBadge";
import { Img } from "./ui/Img";
import { VehicleBadges } from "./VehicleBadges";

// Photo-first card: the picture takes most of the space (a second photo shows
// on hover with a mouse), the text is what people compare.
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
  const [photo, second] = v.images;
  const facts = [v.year, v.mileageKm != null ? `${formatNumber(v.mileageKm)} km` : null, v.fuel, v.gearbox === "Automatique" ? "Auto" : v.gearbox].filter(Boolean);
  const delay = v.status === "sur_commande" ? v.eta || orderDelay : v.status === "arrivage" ? v.eta : "";
  const title = vehicleTitle(v);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white text-ink ring-1 ring-black/[0.08] transition-shadow duration-200 sm:rounded-2xl [@media(hover:hover)]:hover:shadow-[0_6px_20px_-10px_rgba(31,34,36,0.25)]">
      <div className="shimmer relative aspect-[4/3] overflow-hidden">
        {photo ? (
          <>
            {/* Same name as the first photo of the vehicle page: it flies there. */}
            <ViewTransition name={`vehicle-photo-${v.id}`} share="morph" default="none">
              <span className="absolute inset-0 transition-transform duration-500 ease-(--ease-out) [@media(hover:hover)]:group-hover:scale-[1.03]">
                <Img
                  src={thumbUrl(photo)}
                  fallback={photo}
                  alt={`${title} ${v.year ?? ""}`}
                  loading={priority ? "eager" : "lazy"}
                  className={`absolute inset-0 h-full w-full object-cover ${closed ? "grayscale-[70%]" : ""}`}
                />
              </span>
            </ViewTransition>
            {second && !closed && (
              <span className="pointer-events-none absolute inset-0 hidden transition-[opacity,scale] duration-500 ease-(--ease-out) [@media(hover:hover)]:block [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:scale-[1.03] [@media(hover:hover)]:group-hover:opacity-100">
                <Img src={thumbUrl(second)} fallback={second} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </span>
            )}
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-[#eef0f1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/ediat-logo.webp" alt="" loading="lazy" width={480} height={201} className="w-2/5 opacity-80" />
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />
        <StatusBadge status={v.status} small className="absolute top-2 left-2" />
        <div className="absolute top-0 right-0">
          <FavoriteButton id={v.id} label={title} />
        </div>
        <VehicleBadges v={v} max={1} className="absolute bottom-2 left-2" />
        {v.images.length > 1 && (
          <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">
            <CameraIcon className="h-3 w-3" /> {v.images.length}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        <h3 className="truncate text-[14px] leading-tight font-bold sm:text-base">
          <Link href={vehicleHref(v)} className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none">
            {title}
            <LinkPendingOverlay />
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-[12px] text-muted sm:text-[13px]">{facts.join(" · ") || v.version}</p>
        <div className="mt-auto pt-2">
          {v.oldPrice && v.price && v.oldPrice > v.price && !closed && (
            <p className="text-xs text-muted line-through">{formatAr(v.oldPrice)}</p>
          )}
          <p className={`font-display text-[17px] leading-tight font-bold sm:text-xl ${closed ? "text-muted" : v.oldPrice && v.price && v.oldPrice > v.price ? "text-red-700" : "text-ink"}`}>
            {closed ? STATUSES[v.status].short : v.price ? formatAr(v.price) : "Sur demande"}
          </p>
          {monthly && !closed && (
            <p className="mt-0.5 truncate text-[12px] font-semibold text-orange-deep sm:text-[13px]">
              dès {formatAr(monthly)}<span className="font-normal text-muted">/mois</span>
            </p>
          )}
          {delay && !closed && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
              <ClockIcon className="h-3.5 w-3.5 shrink-0 text-cyan-deep" />
              <span className="sr-only">{v.status === "arrivage" ? "Arrivée prévue :" : "Délai :"}</span>
              {v.status === "arrivage" ? `Arrivée ${delay}` : delay}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
