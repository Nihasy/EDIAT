import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { connection } from "next/server";
import { Gallery } from "@/components/Gallery";
import { CalendarIcon, CheckIcon, FuelIcon, GaugeIcon, GearIcon, PhoneIcon } from "@/components/Icons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { VehicleBadges } from "@/components/VehicleBadges";
import { FinanceSimulator } from "@/components/site/FinanceSimulator";
import { LeadForm } from "@/components/site/LeadForm";
import { Rail } from "@/components/site/Rail";
import { StatusBadge } from "@/components/StatusBadge";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { publicVehicle, similarVehicles, siteSettings } from "@/lib/catalog";
import { fromMonthly } from "@/lib/finance";
import { formatAr, formatKm, formatNumber, telLink, waLink } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { idFromSlug, STATUSES, vehicleFullTitle, vehicleHref, vehicleTitle } from "@/lib/vehicle";

// Rendered on each visit from the cached catalogue (lib/catalog): the
// database is not read, and a change made in the back-office shows at once.
async function load(slug: string) {
  await connection();
  const id = idFromSlug(slug);
  return Number.isInteger(id) ? publicVehicle(id) : null;
}

export async function generateMetadata(props: PageProps<"/voitures/[slug]">): Promise<Metadata> {
  const v = await load((await props.params).slug);
  if (!v) return {};
  const facts = [v.year, v.mileageKm != null ? formatKm(v.mileageKm) : "", v.fuel, v.gearbox].filter(Boolean).join(" · ");
  return {
    title: `${vehicleFullTitle(v)} — ${v.price ? formatAr(v.price) : STATUSES[v.status].label}`,
    description: `${vehicleFullTitle(v)} d'occasion, ${facts}. ${STATUSES[v.status].label} chez Ediat Garage, Antananarivo.`,
    alternates: { canonical: vehicleHref(v) },
    openGraph: { images: v.images.slice(0, 1) },
  };
}

export default async function VehiclePage(props: PageProps<"/voitures/[slug]">) {
  const { slug } = await props.params;
  const [v, settings] = await Promise.all([load(slug), siteSettings()]);
  if (!v) notFound();
  if (slug !== v.slug) permanentRedirect(vehicleHref(v));

  const similar = await similarVehicles(v, 8);
  const monthly = fromMonthly(v, settings.finance);
  const closed = v.status === "vendu" || v.status === "reserve";
  const title = vehicleFullTitle(v);
  const url = `${siteUrl()}${vehicleHref(v)}`;
  const waText = closed
    ? `Bonjour Ediat Garage, le ${title} (${v.ref}) n'est plus disponible. Avez-vous un modèle similaire ?\n${url}`
    : `Bonjour Ediat Garage, je suis intéressé(e) par le ${title} (réf. ${v.ref}) à ${v.price ? formatAr(v.price) : "prix à confirmer"}.\n${url}`;
  const specs = [
    ["Année", v.year ? String(v.year) : ""],
    ["Kilométrage", formatKm(v.mileageKm)],
    ["Carburant", v.fuel],
    ["Boîte", v.gearbox],
    ["Moteur", v.engine],
    ["Puissance", v.powerHp ? `${v.powerHp} ch` : ""],
    ["Transmission", v.drive],
    ["Type", v.body],
    ["Places", v.seats ? String(v.seats) : ""],
    ["Portes", v.doors ? String(v.doors) : ""],
    ["Couleur", v.color],
    ["Provenance", v.origin],
    ["Référence", v.ref],
  ].filter(([, value]) => value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: { "@type": "Brand", name: v.brand },
    model: v.model,
    vehicleModelDate: v.year ?? undefined,
    mileageFromOdometer: v.mileageKm != null ? { "@type": "QuantitativeValue", value: v.mileageKm, unitCode: "KMT" } : undefined,
    fuelType: v.fuel || undefined,
    vehicleTransmission: v.gearbox || undefined,
    color: v.color || undefined,
    itemCondition: "https://schema.org/UsedCondition",
    image: v.images.slice(0, 5),
    url,
    offers: v.price
      ? {
          "@type": "Offer",
          price: v.price,
          priceCurrency: "MGA",
          availability: closed ? "https://schema.org/SoldOut" : v.status === "showroom" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        }
      : undefined,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <nav aria-label="Fil d'Ariane" className="text-sm text-muted [&_a]:inline-block [&_a]:px-1 [&_a]:py-3">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-ink">Accueil</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/voitures" className="hover:text-ink">Véhicules</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/voitures?marque=${encodeURIComponent(v.brand)}`} className="hover:text-ink">{v.brand}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{v.model}</li>
          </ol>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-0 pt-2 sm:px-4 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Gallery
            images={v.images}
            alt={title}
            overlay={
              <>
                <StatusBadge status={v.status} long className="absolute top-3 left-3" />
                <div className="absolute top-1 right-1 flex">
                  <ShareButton title={title} url={url} />
                  <FavoriteButton id={v.id} label={title} />
                </div>
              </>
            }
          />

          <div className="mt-6 px-4 sm:px-0">
            <VehicleBadges v={v} max={4} size="md" />
            <h1 className="font-display mt-3 text-4xl leading-tight font-bold sm:text-5xl">{vehicleTitle(v)}</h1>
            <p className="mt-1 text-lg text-muted">{[v.version, v.year].filter(Boolean).join(" · ")}</p>

            <ul className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { k: "Année", val: v.year ? String(v.year) : "—", icon: <CalendarIcon className="h-6 w-6" /> },
                { k: "Kilométrage", val: v.mileageKm != null ? `${formatNumber(v.mileageKm)} km` : "—", icon: <GaugeIcon className="h-6 w-6" /> },
                { k: "Carburant", val: v.fuel || "—", icon: <FuelIcon className="h-6 w-6" /> },
                { k: "Boîte", val: v.gearbox || "—", icon: <GearIcon className="h-6 w-6" /> },
              ].map(({ k, val, icon }) => (
                <li key={k} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-1 py-3 text-center ring-1 ring-black/5 sm:py-4">
                  <span className="text-cyan-deep">{icon}</span>
                  <span className="text-[13px] leading-tight font-bold sm:text-[15px]">{val}</span>
                  <span className="text-[10px] tracking-wide text-muted uppercase sm:text-[11px]">{k}</span>
                </li>
              ))}
            </ul>

            {/* Price summary on phones (the side box is for large screens). */}
            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 lg:hidden">
              {v.oldPrice && v.price && v.oldPrice > v.price && <p className="text-sm text-muted line-through">{formatAr(v.oldPrice)}</p>}
              <p className={`font-display text-3xl font-bold ${closed ? "text-muted" : ""}`}>{v.price ? formatAr(v.price) : "Prix sur demande"}</p>
              {monthly && !closed && (
                <a href="#financement" className="bg-orange-gradient mt-2 block rounded-full px-4 py-3 text-center text-sm text-white">
                  à partir de <strong>{formatAr(monthly)}</strong> / mois
                </a>
              )}
              <p className="mt-3 text-sm text-black/75">
                {STATUSES[v.status].hint}
                {v.status === "sur_commande" && <> <strong className="text-ink">Délai : {v.eta || settings.orderDelay}</strong>.</>}
                {v.status === "arrivage" && v.eta && <> <strong className="text-ink">Arrivée prévue : {v.eta}</strong>.</>}
              </p>
              <a href="#contact" className="btn-dark mt-3 w-full">{v.status === "showroom" ? "Réserver un essai" : "Être rappelé"}</a>
            </div>

            <section aria-labelledby="carac" className="mt-10">
              <h2 id="carac" className="font-display text-2xl font-semibold">Caractéristiques</h2>
              <dl className="mt-4 grid overflow-hidden rounded-2xl border border-black/10 bg-white sm:grid-cols-2">
                {specs.map(([k, val]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-black/5 px-4 py-3 text-[15px] sm:odd:border-r">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium">{val}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {v.description && (
              <section aria-labelledby="desc" className="mt-10">
                <h2 id="desc" className="font-display text-2xl font-semibold">Le mot du vendeur</h2>
                <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-black/80">{v.description}</p>
              </section>
            )}

            {v.equipment.length > 0 && (
              <section aria-labelledby="equip" className="mt-10">
                <h2 id="equip" className="font-display text-2xl font-semibold">Équipements</h2>
                <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {v.equipment.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-[15px]"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-deep" /> {e}</li>
                  ))}
                </ul>
              </section>
            )}

            {monthly && !closed && v.price && (
              <section id="financement" aria-labelledby="fin" className="mt-10 scroll-mt-24 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                <h2 id="fin" className="font-display text-2xl font-semibold">
                  Payez à votre rythme avec <span className="text-orange-deep">{settings.finance.name}</span>
                </h2>
                <div className="mt-5">
                  <FinanceSimulator settings={settings.finance} price={v.price} vehicleLabel={`${title} (${v.ref})`} whatsapp={settings.whatsapp} />
                </div>
              </section>
            )}

            <section id="contact" aria-labelledby="rdv" className="mt-10 scroll-mt-24 rounded-2xl bg-ink p-5 text-white sm:p-6">
              <h2 id="rdv" className="font-display text-2xl font-semibold">
                {closed ? "Je veux un véhicule similaire" : v.status === "showroom" ? "Réserver un essai au showroom" : "Réserver ce véhicule"}
              </h2>
              <p className="mt-1 mb-5 text-sm text-white/70">Laissez vos coordonnées, un conseiller vous rappelle.</p>
              <LeadForm
                dark
                kind={v.status === "showroom" ? "essai" : "vehicule"}
                vehicleId={v.id}
                extra={v.status === "showroom" ? [{ name: "date", label: "Jour souhaité", type: "date" }] : []}
                submitLabel={v.status === "showroom" ? "Demander un essai" : "Être rappelé"}
                whatsapp={settings.whatsapp}
                whatsappText={waText}
              />
            </section>
          </div>
        </div>

        {/* PRICE BOX */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="card overflow-hidden">
              <div className="p-5">
                <p className="text-sm text-muted">{closed ? STATUSES[v.status].label : "Prix TTC"}</p>
                {v.oldPrice && v.price && v.oldPrice > v.price && <p className="text-muted line-through">{formatAr(v.oldPrice)}</p>}
                <p className={`font-display text-4xl font-bold ${closed ? "text-muted" : ""}`}>{v.price ? formatAr(v.price) : "Prix sur demande"}</p>
                {monthly && !closed && (
                  <a href="#financement" className="bg-orange-gradient mt-3 block rounded-full px-4 py-2 text-center text-sm text-white">
                    à partir de <strong>{formatAr(monthly)}</strong> / mois
                  </a>
                )}
                <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-black/75">
                  {STATUSES[v.status].hint}
                  {v.status === "sur_commande" && (
                    <><br /><strong className="text-ink">Délai : {v.eta || settings.orderDelay}</strong> · acompte {settings.orderDepositPct} %</>
                  )}
                  {v.status === "arrivage" && v.eta && <><br /><strong className="text-ink">Arrivée prévue : {v.eta}</strong></>}
                </p>
              </div>
              <div className="grid gap-2 border-t border-black/10 bg-paper/60 p-4">
                <a href={waLink(settings.whatsapp, waText)} target="_blank" rel="noopener" className="btn-whatsapp w-full">
                  <WhatsAppIcon className="h-4 w-4" /> {closed ? "Demander un modèle similaire" : "Je suis intéressé(e)"}
                </a>
                <a href={telLink(settings.phone)} className="btn-ghost w-full"><PhoneIcon className="h-4 w-4" /> Appeler</a>
                <a href="#contact" className="btn-dark w-full">{v.status === "showroom" ? "Réserver un essai" : "Être rappelé"}</a>
              </div>
            </div>
            <ul className="card space-y-2 p-5 text-sm text-black/75">
              <li className="flex gap-2"><CheckIcon className="h-4 w-4 shrink-0 text-cyan-deep" /> Importé et contrôlé par Ediat Garage</li>
              <li className="flex gap-2"><CheckIcon className="h-4 w-4 shrink-0 text-cyan-deep" /> Dédouanement et papiers en règle</li>
              <li className="flex gap-2"><CheckIcon className="h-4 w-4 shrink-0 text-cyan-deep" /> Reprise de votre véhicule possible</li>
            </ul>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="mt-6">
          <Rail id="similaires" kicker="Vous aimerez aussi" title="Similaires" href={`/voitures?marque=${encodeURIComponent(v.brand)}`}>
            {similar.map((o) => <VehicleCard key={o.id} v={o} finance={settings.finance} orderDelay={settings.orderDelay} />)}
          </Rail>
        </div>
      )}

      {/* MOBILE ACTION BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2 min-[380px]:gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-base leading-tight font-bold min-[380px]:text-lg">{v.price ? formatAr(v.price) : "Prix sur demande"}</p>
            {monthly && !closed ? <p className="truncate text-xs text-orange-deep">dès {formatAr(monthly)} / mois</p> : <p className="truncate text-xs text-muted">{STATUSES[v.status].short}</p>}
          </div>
          <FavoriteButton id={v.id} label={title} variant="plain" />
          <a href={telLink(settings.phone)} aria-label="Appeler" className="flex h-11 w-11 shrink-0 items-center min-[380px]:h-12 min-[380px]:w-12 justify-center rounded-full border border-black/15"><PhoneIcon className="h-5 w-5" /></a>
          <a href={waLink(settings.whatsapp, waText)} target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp" className="btn-whatsapp h-11 shrink-0 px-3.5 min-[380px]:h-12 min-[380px]:px-4"><WhatsAppIcon className="h-5 w-5" /> <span className="hidden min-[400px]:inline">WhatsApp</span></a>
        </div>
      </div>
    </div>
  );
}
