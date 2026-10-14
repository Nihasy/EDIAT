import Link from "next/link";
import { DocIcon, KeyIcon, SearchIcon, ShieldIcon, ShipIcon, WalletIcon } from "@/components/Icons";
import { BodyIcon } from "@/components/site/BodyIcon";
import { HeroCarousel, type Slide } from "@/components/site/HeroCarousel";
import { Rail } from "@/components/site/Rail";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { publicVehicles, siteSettings } from "@/lib/catalog";
import { fromMonthly } from "@/lib/finance";
import { formatAr, formatNumber, waLink } from "@/lib/format";
import { BODIES, FEATURED_BRANDS, STATUSES, vehicleHref, vehicleTitle, type Vehicle } from "@/lib/vehicle";

// Served from the cache, rebuilt after each back-office change.
export const revalidate = 3600;

const BRAND_LOGOS: Record<string, string> = {
  Hyundai: "/brands/hyundai.jpg",
  Kia: "/brands/kia.jpg",
  SsangYong: "/brands/ssangyong.jpg",
  Daewoo: "/brands/daewoo.jpg",
};

function countBy(list: Vehicle[], key: (v: Vehicle) => string) {
  const map = new Map<string, number>();
  for (const v of list) if (key(v)) map.set(key(v), (map.get(key(v)) ?? 0) + 1);
  return map;
}

export default async function HomePage() {
  const [all, settings] = await Promise.all([publicVehicles(), siteSettings()]);
  const listed = all.filter((v) => STATUSES[v.status].listed);
  const showroom = listed.filter((v) => v.status === "showroom");
  const arrivage = listed.filter((v) => v.status === "arrivage");
  const onOrder = listed.filter((v) => v.status === "sur_commande");
  const sold = all.filter((v) => v.status === "vendu").slice(0, 8);
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
  const brandList = [...new Set([...FEATURED_BRANDS, ...[...brands.keys()]])];
  const bodyList = [...new Set([...[...bodies.keys()], ...BODIES.slice(0, 6)])].filter((b) => BODIES.includes(b)).slice(0, 8);

  return (
    <>
      {slides.length ? (
        <HeroCarousel slides={slides} />
      ) : (
        <section className="bg-brand-gradient px-4 py-14 text-white">
          <h1 className="font-display mx-auto max-w-7xl text-5xl font-bold">Véhicules d&apos;occasion de Corée</h1>
        </section>
      )}

      {/* QUICK SEARCH */}
      <div className="relative z-10 mx-auto -mt-3 max-w-7xl px-0 sm:mt-5 sm:px-4">
        <div className="rounded-t-3xl bg-paper px-4 pt-5 pb-1 sm:rounded-3xl sm:bg-white sm:p-5 sm:shadow-xl">
          <h1 className="sr-only">Ediat Garage, véhicules d&apos;occasion importés de Corée à Antananarivo</h1>
          <form action="/voitures" role="search" className="flex items-center gap-2 rounded-full bg-white py-1 pr-1 pl-4 shadow-sm ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-cyan-deep sm:bg-paper sm:shadow-none">
            <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
            <label htmlFor="home-q" className="sr-only">Rechercher un véhicule</label>
            <input id="home-q" name="q" type="search" placeholder="Tucson, Sportage, Rexton…" className="min-w-0 flex-1 bg-transparent py-2.5 outline-none" />
            <button type="submit" className="btn-primary px-5 py-2.5">Chercher</button>
          </form>
          <nav aria-label="Disponibilité" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {[
              { href: "/voitures?dispo=showroom", label: "Dispo de suite", n: showroom.length, dot: "bg-emerald-500" },
              { href: "/voitures?dispo=arrivage", label: "En arrivage", n: arrivage.length, dot: "bg-cyan" },
              { href: "/voitures?dispo=sur_commande", label: "Sur commande", n: onOrder.length, dot: "bg-orange" },
              { href: "/voitures", label: "Tout le stock", n: listed.length, dot: "bg-ink" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="flex shrink-0 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-black/10 hover:ring-ink sm:bg-paper">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden="true" /> {c.label} <span className="text-muted">{c.n}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* BODY TYPES */}
      <section aria-label="Par type de véhicule" className="mx-auto max-w-7xl pt-4">
        <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:grid md:grid-cols-8 [&::-webkit-scrollbar]:hidden">
          {bodyList.map((b) => (
            <li key={b} className="shrink-0">
              <Link href={`/voitures?carrosserie=${encodeURIComponent(b)}`} className="flex w-[84px] flex-col items-center gap-1 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-black/5 transition hover:text-orange-deep hover:ring-orange-deep md:w-auto">
                <BodyIcon type={b} className="h-7 w-14 text-ink/80" />
                <span className="text-xs font-semibold">{b}</span>
                <span className="text-[11px] text-muted">{bodies.get(b) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* BRANDS */}
      <section aria-label="Par marque" className="mx-auto max-w-7xl pt-4">
        <ul className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden">
          {brandList.map((b) => (
            <li key={b} className="shrink-0">
              <Link href={`/voitures?marque=${encodeURIComponent(b)}`} className="group flex w-[76px] flex-col items-center gap-1.5 sm:w-24">
                <span className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-cyan/60 transition group-hover:ring-orange sm:h-24 sm:w-24">
                  {BRAND_LOGOS[b] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={BRAND_LOGOS[b]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display px-1 text-center text-sm leading-tight font-bold text-ink">{b}</span>
                  )}
                </span>
                <span className="text-xs font-semibold">{b} <span className="font-normal text-muted">{brands.get(b) ?? 0}</span></span>
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
        <section className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/financement" className="bg-orange-gradient group relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 text-white shadow-lg sm:p-8">
            <span className="font-display pointer-events-none absolute -top-8 right-3 text-[150px] leading-none text-white/20 sm:right-10 sm:text-[220px]" aria-hidden="true">!</span>
            <div className="relative min-w-0 flex-1">
              <p className="font-display text-[34px] leading-[0.95] font-bold sm:text-6xl">
                Roulez <span className="text-xl font-semibold text-white/85 sm:text-3xl">aujourd&apos;hui</span>
                <br />
                <span className="text-[#9eeaff]">Payez</span> <span className="text-xl font-semibold text-white/85 sm:text-3xl">à votre rythme</span>
              </p>
              <p className="mt-2 text-sm text-white/90">{settings.finance.name} · apport dès {settings.finance.minDownPct} % · {settings.finance.durations.join("/")} mois</p>
            </div>
            <span className="relative hidden shrink-0 rounded-full bg-white px-5 py-3 text-sm font-semibold text-orange-deep sm:inline-block">Simuler →</span>
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
            <Rail dark id="commande" kicker={`Import de Corée · ${settings.orderDelay}`} title="Sur commande" count={onOrder.length} href="/voitures?dispo=sur_commande">
              {onOrder.slice(0, 10).map((v) => <VehicleCard key={v.id} v={v} {...card} />)}
            </Rail>
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 pt-2 pb-8">
          <ol className="grid grid-cols-4 gap-2 text-center">
            {[
              { icon: <DocIcon className="h-6 w-6" />, t: "Votre demande" },
              { icon: <ShieldIcon className="h-6 w-6" />, t: "Contrôle en Corée" },
              { icon: <ShipIcon className="h-6 w-6" />, t: "Expédition" },
              { icon: <KeyIcon className="h-6 w-6" />, t: "Clés en main" },
            ].map((s, i) => (
              <li key={s.t} className="flex flex-col items-center gap-1.5">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-cyan">
                  {s.icon}
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-[11px] font-bold text-white">{i + 1}</span>
                </span>
                <span className="text-[11px] leading-tight text-white/80 sm:text-sm">{s.t}</span>
              </li>
            ))}
          </ol>
          <Link href="/sur-commande#demande" className="btn-primary mt-5 w-full sm:w-auto">Faire importer mon véhicule</Link>
        </div>
      </section>

      {/* TRUST */}
      <section aria-label="Nos engagements" className="mx-auto max-w-7xl px-4 py-6">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            { icon: <ShipIcon className="h-5 w-5" />, t: "Import direct Corée" },
            { icon: <ShieldIcon className="h-5 w-5" />, t: "Véhicules contrôlés" },
            { icon: <DocIcon className="h-5 w-5" />, t: "Carte grise incluse" },
            { icon: <WalletIcon className="h-5 w-5" />, t: "Paiement échelonné" },
          ].map((x) => (
            <li key={x.t} className="flex items-center gap-2.5 rounded-2xl bg-white p-3 text-sm font-semibold ring-1 ring-black/5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan/10 text-cyan-deep">{x.icon}</span>
              {x.t}
            </li>
          ))}
        </ul>
      </section>

      {sold.length > 0 && (
        <Rail id="vendus" kicker="Ils roulent déjà" title="Récemment vendus">
          {sold.map((v) => <VehicleCard key={v.id} v={v} {...card} />)}
        </Rail>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-2 pb-10">
        <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-6 text-white sm:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/eg-mark.png" alt="" aria-hidden="true" className="absolute -right-4 -bottom-8 h-40 opacity-25 sm:h-56" />
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
