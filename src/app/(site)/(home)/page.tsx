import type { Metadata } from "next";
import { HOME_TITLE, pageMeta, SITE_DESCRIPTION } from "@/lib/seo";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRightIcon, DocIcon, KeyIcon, ShieldIcon, ShipIcon, WalletIcon } from "@/components/Icons";
import { BodyIcon } from "@/components/site/BodyIcon";
import { SearchBox } from "@/components/site/SearchBox";
import { HeroCarousel, type Slide } from "@/components/site/HeroCarousel";
import { Rail } from "@/components/site/Rail";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { publicVehicles, siteSettings } from "@/lib/catalog";
import { fromMonthly } from "@/lib/finance";
import { formatAr, formatNumber, waLink } from "@/lib/format";
import { BRANDS, BRAND_LOGOS } from "@/lib/brands";
import { BODIES, FEATURED_BRANDS, STATUSES, vehicleHref, vehicleTitle, type Vehicle } from "@/lib/vehicle";

// Rendered on each visit from the cached catalogue (lib/catalog): the
// database is not read, and a change made in the back-office shows at once.

function countBy(list: Vehicle[], key: (v: Vehicle) => string) {
  const map = new Map<string, number>();
  for (const v of list) if (key(v)) map.set(key(v), (map.get(key(v)) ?? 0) + 1);
  return map;
}

export const metadata: Metadata = {
  ...pageMeta({ title: HOME_TITLE, description: SITE_DESCRIPTION, path: "/" }),
  title: { absolute: HOME_TITLE },
};

export default async function HomePage() {
  await connection();
  const [all, settings] = await Promise.all([publicVehicles(), siteSettings()]);
  const listed = all.filter((v) => STATUSES[v.status].listed);
  const showroom = listed.filter((v) => v.status === "showroom");
  const arrivage = listed.filter((v) => v.status === "arrivage");
  const onOrder = listed.filter((v) => v.status === "sur_commande");
  // Latest sales first (a car sold today was often published months ago).
  const sold = all
    .filter((v) => v.status === "vendu")
    .sort((a, b) => (b.soldAt ?? b.updatedAt).localeCompare(a.soldAt ?? a.updatedAt))
    .slice(0, 8);
  const brands = countBy(listed, (v) => v.brand);
  const bodies = countBy(listed, (v) => v.body);
  const card = { finance: settings.finance, orderDelay: settings.orderDelay };

  const slides: Slide[] = [...listed.filter((v) => v.featured), ...showroom, ...arrivage, ...onOrder]
    .filter((v, i, a) => v.images.length && a.indexOf(v) === i && v.status !== "reserve")
    .slice(0, 6)
    .map((v) => {
      const monthly = fromMonthly(v, settings.finance);
      return {
        href: vehicleHref(v),
        image: v.images[0],
        title: vehicleTitle(v),
        subtitle: [v.year, v.mileageKm != null ? `${formatNumber(v.mileageKm)} km` : "", v.fuel, v.gearbox].filter(Boolean).join(" · "),
        price: v.price ? formatAr(v.price) : "Prix sur demande",
        monthly: monthly ? formatAr(monthly) : null,
        status: v.status,
      };
    });
  // Main brands of the stock first, then the others in stock (most cars first), then every other brand A–Z.
  const inStock = [...brands.keys()].sort((a, b) => (brands.get(b) ?? 0) - (brands.get(a) ?? 0));
  const brandList = [...new Set([...FEATURED_BRANDS, ...inStock, ...BRANDS])];
  const bodyList = [...new Set([...[...bodies.keys()], ...BODIES.slice(0, 6)])].filter((b) => BODIES.includes(b)).slice(0, 8);

  return (
    <>
      {slides.length ? (
        <HeroCarousel slides={slides} />
      ) : (
        <section className="bg-ink px-4 py-14 text-white">
          <h1 className="font-display mx-auto max-w-7xl text-5xl font-bold">Voitures d&apos;occasion à Antananarivo</h1>
        </section>
      )}

      {/* QUICK SEARCH */}
      <div className="relative z-10 mx-auto -mt-3 max-w-7xl px-0 sm:-mt-10 sm:px-4 short:mt-4">
        <div className="rounded-t-3xl bg-paper px-4 pt-5 pb-1 sm:rounded-3xl sm:bg-white sm:p-5 sm:shadow-[0_8px_24px_-12px_rgba(31,34,36,0.18)] sm:ring-1 sm:ring-black/5">
          <h1 className="sr-only">Ediat Garage, voitures d&apos;occasion importées à Antananarivo, Madagascar</h1>
          <SearchBox
            popularBrands={[...brands.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6).map(([name, n]) => ({ name, n }))}
            whatsappHref={waLink(settings.whatsapp, "Bonjour Ediat Garage, je cherche un véhicule : ")}
            placeholder="Tucson, Sportage, Rexton, diesel…"
          />
          <nav aria-label="Disponibilité" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:px-0 md:justify-center [&::-webkit-scrollbar]:hidden">
            {[
              { href: "/voitures?dispo=showroom", label: "Dispo de suite", n: showroom.length, dot: "bg-emerald-500" },
              { href: "/voitures?dispo=arrivage", label: "En arrivage", n: arrivage.length, dot: "bg-cyan" },
              { href: "/voitures?dispo=sur_commande", label: "Sur commande", n: onOrder.length, dot: "bg-orange" },
              { href: "/voitures", label: "Tout le stock", n: listed.length, dot: "bg-ink" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-black/10 transition-colors duration-200 hover:ring-ink sm:bg-paper">
                <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} aria-hidden="true" /> {c.label} <span className="text-muted">{c.n}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* BODY TYPES */}
      <section aria-label="Par type de véhicule" className="reveal mx-auto max-w-7xl pt-6 sm:pt-10">
        <ul className="flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:grid md:grid-cols-8 [&::-webkit-scrollbar]:hidden">
          {bodyList.map((b) => (
            <li key={b} className="shrink-0">
              <Link href={`/voitures?carrosserie=${encodeURIComponent(b)}`} className="group/body flex w-[84px] flex-col items-center gap-1 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-black/5 transition-[color,box-shadow] duration-200 hover:text-orange-deep hover:ring-orange-deep md:w-auto">
                <BodyIcon type={b} className="h-[26px] w-[70px] text-ink/80 transition-colors duration-300 group-hover/body:text-orange-deep" />
                <span className="text-xs font-semibold">{b}</span>
                <span className="text-xs text-muted tabular-nums">{bodies.get(b) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* BRANDS */}
      <section aria-label="Par marque" className="reveal mx-auto max-w-7xl pt-4 sm:pt-6">
        <ul className="flex gap-3 overflow-x-auto px-4 pt-2 pb-2 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden">
          {brandList.map((b, i) => (
            <li key={b} className="shrink-0">
              <Link href={`/voitures?marque=${encodeURIComponent(b)}`} className="group flex w-[76px] flex-col items-center gap-1.5 sm:w-24">
                <span className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-cyan/60 transition-[box-shadow] duration-200 group-hover:ring-orange sm:h-24 sm:w-24">
                  {BRAND_LOGOS[b] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={BRAND_LOGOS[b]} alt="" loading={i < 8 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display px-1 text-center text-sm leading-tight font-bold text-ink">{b}</span>
                  )}
                </span>
                <span className="text-xs font-semibold">{b}{brands.get(b) ? <> <span className="font-normal text-muted">{brands.get(b)}</span></> : null}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {showroom.length > 0 && (
        <Rail id="showroom" kicker="Dispo de suite" title="Au showroom" count={showroom.length} href="/voitures?dispo=showroom">
          {showroom.slice(0, 10).map((v, i) => <VehicleCard key={v.id} v={v} {...card} priority={i < 2} />)}
        </Rail>
      )}

      {/* EDIAT FACILITY */}
      {settings.finance.enabled && (
        <section className="reveal mx-auto max-w-7xl px-4 py-4">
          <Link href="/financement" className="bg-orange-gradient group relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 text-white sm:p-8">
            <div className="relative min-w-0 flex-1">
              <p className="font-display text-[34px] leading-[0.95] font-bold sm:text-6xl">
                Roulez <span className="text-xl font-semibold text-white/85 sm:text-3xl">aujourd&apos;hui</span>
                <br />
                <span className="text-[#9eeaff]">Payez</span> <span className="text-xl font-semibold text-white/85 sm:text-3xl">à votre rythme</span>
              </p>
              <p className="mt-2 text-sm text-white/90">{settings.finance.name} · {settings.finance.product} avec la {settings.finance.partner} · jusqu&apos;à {Math.max(...settings.finance.durations)} mois</p>
            </div>
            <span className="relative hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-orange-deep transition-colors duration-200 group-hover:bg-white/90 sm:inline-flex">Simuler <ArrowRightIcon className="h-4 w-4" /></span>
          </Link>
        </section>
      )}

      {arrivage.length > 0 && (
        <Rail id="arrivage" kicker="Bientôt à Tana" title="En arrivage" count={arrivage.length} href="/voitures?dispo=arrivage">
          {arrivage.slice(0, 10).map((v) => <VehicleCard key={v.id} v={v} {...card} />)}
        </Rail>
      )}

      {/* ON ORDER */}
      <section className="mt-4 bg-ink py-2 text-white">
        {onOrder.length > 0 && (
          <div>
            <Rail dark id="commande" kicker={`Import sur commande · ${settings.orderDelay}`} title="Sur commande" count={onOrder.length} href="/voitures?dispo=sur_commande">
              {onOrder.slice(0, 10).map((v) => <VehicleCard key={v.id} v={v} {...card} />)}
            </Rail>
          </div>
        )}
        <div className="reveal mx-auto max-w-7xl px-4 pt-2 pb-10">
          <ol className="relative grid grid-cols-4 gap-2 text-center">
            {/* Route line behind the steps. */}
            <span className="absolute top-6 right-[12.5%] left-[12.5%] h-px bg-gradient-to-r from-cyan/60 via-white/25 to-orange/70 sm:top-7" aria-hidden="true" />
            {[
              { icon: <DocIcon className="h-6 w-6" />, t: "Votre demande" },
              { icon: <ShieldIcon className="h-6 w-6" />, t: "Contrôle avant achat" },
              { icon: <ShipIcon className="h-6 w-6" />, t: "Expédition" },
              { icon: <KeyIcon className="h-6 w-6" />, t: "Clés en main" },
            ].map((s, i) => (
              <li key={s.t} className="relative flex flex-col items-center gap-2">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2e31] text-cyan ring-1 ring-white/15 sm:h-14 sm:w-14">
                  {s.icon}
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-[11px] font-bold text-ink">{i + 1}</span>
                </span>
                <span className="text-xs leading-tight font-medium text-white/85 sm:text-sm">{s.t}</span>
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/sur-commande#demande" className="btn-primary w-full sm:w-auto">Faire importer mon véhicule</Link>
            <p className="text-xs text-white/65">Délai {settings.orderDelay} · acompte {settings.orderDepositPct} %</p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section aria-labelledby="engagements" className="reveal mx-auto max-w-7xl px-4 pt-10 pb-4">
        <h2 id="engagements" className="sr-only">Nos engagements</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: <ShipIcon className="h-5 w-5" />, t: "Import direct", d: "Sans intermédiaire, au juste prix." },
            { icon: <ShieldIcon className="h-5 w-5" />, t: "Véhicules contrôlés", d: "Inspectés avant l'expédition." },
            { icon: <WalletIcon className="h-5 w-5" />, t: "Paiement échelonné", d: `${settings.finance.name}, avec la ${settings.finance.partner}.` },
          ].map((x) => (
            <li key={x.t} className="rounded-2xl bg-white p-4 ring-1 ring-black/5 sm:p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan-deep">{x.icon}</span>
              <p className="mt-3 text-sm leading-tight font-bold sm:text-base">{x.t}</p>
              <p className="mt-1 text-xs leading-snug text-muted sm:text-sm">{x.d}</p>
            </li>
          ))}
        </ul>
      </section>

      {sold.length > 0 && (
        <Rail id="vendus" kicker="Ils roulent déjà" title="Récemment vendus">
          {sold.map((v) => <VehicleCard key={v.id} v={v} {...card} />)}
        </Rail>
      )}

      <section className="reveal mx-auto max-w-7xl px-4 pt-2 pb-10">
        <div className="bg-ink relative overflow-hidden rounded-3xl p-6 text-white sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-orange)_0_60%,var(--color-cyan)_60%_100%)]" aria-hidden="true" />
          <h2 className="font-display relative text-3xl font-bold sm:text-4xl">Pas trouvé votre modèle ?</h2>
          <p className="relative mt-1 text-white/90">On l&apos;importe pour vous.</p>
          <div className="relative mt-5 flex flex-wrap gap-2">
            <Link href="/sur-commande#demande" className="btn-primary">Le demander</Link>
            <a href={waLink(settings.whatsapp, "Bonjour Ediat Garage, je cherche un véhicule : ")} target="_blank" rel="noopener" className="btn-whatsapp">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
