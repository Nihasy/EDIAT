import Link from "next/link";
import { CalendarIcon, CarIcon, CheckIcon, DocIcon, KeyIcon, ShieldIcon, ShipIcon, WalletIcon } from "@/components/Icons";
import { HeroSearch } from "@/components/site/HeroSearch";
import { SectionTitle } from "@/components/site/SectionTitle";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { publicVehicles, siteSettings } from "@/lib/catalog";
import { formatAr, waLink } from "@/lib/format";
import { FEATURED_BRANDS, STATUSES, type Vehicle } from "@/lib/vehicle";

// Served from the cache, rebuilt after each back-office change.
export const revalidate = 3600;

function countBy(list: Vehicle[], key: (v: Vehicle) => string) {
  const map = new Map<string, number>();
  for (const v of list) if (key(v)) map.set(key(v), (map.get(key(v)) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([value, n]) => ({ value, n }));
}

export default async function HomePage() {
  const [all, settings] = await Promise.all([publicVehicles(), siteSettings()]);
  const listed = all.filter((v) => STATUSES[v.status].listed);
  const showroom = listed.filter((v) => v.status === "showroom");
  const arrivage = listed.filter((v) => v.status === "arrivage");
  const onOrder = listed.filter((v) => v.status === "sur_commande");
  const sold = all.filter((v) => v.status === "vendu").slice(0, 4);
  const brands = countBy(listed, (v) => v.brand);
  const counts = { all: listed.length, showroom: showroom.length, sur_commande: onOrder.length };
  const brandTiles = [...new Set([...FEATURED_BRANDS, ...brands.map((b) => b.value)])].slice(0, 8);
  const card = { finance: settings.finance, orderDelay: settings.orderDelay };

  return (
    <>
      {/* HERO */}
      <section className="bg-brand-gradient relative overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/eg-mark.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -bottom-24 h-[130%] opacity-[0.12] select-none sm:right-0 lg:right-16 lg:opacity-25"
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-12 sm:pt-16 lg:pt-20 lg:pb-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold tracking-wide backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-cyan" aria-hidden="true" /> Importateur de véhicules d&apos;occasion de Corée
          </p>
          <h1 className="font-display mt-5 max-w-3xl text-[44px] leading-[0.95] font-bold drop-shadow sm:text-6xl lg:text-7xl">
            Votre voiture coréenne,
            <span className="block text-orange">sans mauvaise surprise.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/90 sm:text-lg">
            Hyundai, Kia, SsangYong, Daewoo… Choisissez au showroom, réservez un arrivage ou faites importer le modèle exact
            que vous voulez. Et payez à votre rythme avec <strong className="text-white">{settings.finance.name}</strong>.
          </p>
          <div className="mt-8 max-w-4xl">
            <HeroSearch brands={brands} bodies={countBy(listed, (v) => v.body)} counts={counts} />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            {["Véhicules contrôlés avant expédition", "Dédouanement et carte grise gérés", "Essai au showroom"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><CheckIcon className="h-4 w-4 text-cyan" /> {t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 WAYS TO BUY */}
      <section aria-labelledby="formules" className="mx-auto -mt-px max-w-7xl px-4 py-14">
        <SectionTitle kicker="Comment acheter" id="formules" title="Trois façons d'avoir votre véhicule" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              status: "showroom" as const,
              icon: <KeyIcon className="h-7 w-7" />,
              title: "Disponible au showroom",
              text: "Déjà dédouané et immatriculable. Venez l'essayer, repartez avec.",
              delay: "Immédiat",
              n: showroom.length,
              color: "text-emerald-700 bg-emerald-50",
            },
            {
              status: "arrivage" as const,
              icon: <ShipIcon className="h-7 w-7" />,
              title: "En cours d'arrivage",
              text: "Acheté en Corée, en route vers Tamatave. Réservez-le avant tout le monde.",
              delay: "Quelques semaines",
              n: arrivage.length,
              color: "text-cyan-deep bg-cyan/10",
            },
            {
              status: "sur_commande" as const,
              icon: <DocIcon className="h-7 w-7" />,
              title: "Sur commande",
              text: "Dites-nous le modèle, l'année et le budget : on le trouve, on le contrôle, on l'importe.",
              delay: settings.orderDelay,
              n: onOrder.length,
              color: "text-orange-deep bg-orange/10",
            },
          ].map((f) => (
            <Link
              key={f.status}
              href={f.status === "sur_commande" ? "/sur-commande" : `/voitures?dispo=${f.status}`}
              className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-lg"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>{f.icon}</span>
              <h3 className="font-display mt-4 text-2xl font-semibold">{f.title}</h3>
              <p className="mt-2 flex-1 text-[15px] text-black/70">{f.text}</p>
              <p className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-sm">
                <span className="text-muted">Délai : <strong className="text-ink">{f.delay}</strong></span>
                <span className="font-semibold text-orange-deep group-hover:underline">
                  {f.status === "sur_commande" ? "Commander" : `${f.n} véhicule${f.n > 1 ? "s" : ""}`} →
                </span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* SHOWROOM */}
      {showroom.length > 0 && (
        <section aria-labelledby="showroom" className="mx-auto max-w-7xl px-4 pb-14">
          <SectionTitle
            kicker="Dispo de suite"
            id="showroom"
            title="Disponibles au showroom"
            link={showroom.length > 8 ? { href: "/voitures?dispo=showroom", label: `Voir les ${showroom.length} véhicules` } : undefined}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {showroom.slice(0, 8).map((v, i) => (
              <VehicleCard key={v.id} v={v} {...card} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* EDIAT FACILITY */}
      {settings.finance.enabled && (
        <section className="bg-swirl">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
            <div className="bg-orange-gradient relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl sm:p-10">
              <span className="font-display pointer-events-none absolute -top-6 right-6 text-[180px] leading-none text-white/90" aria-hidden="true">!</span>
              <p className="font-display text-6xl leading-[0.9] font-bold sm:text-7xl">Roulez</p>
              <p className="font-display text-2xl text-white/90">aujourd&apos;hui</p>
              <p className="font-display mt-2 text-6xl leading-[0.9] font-bold text-[#7fe3ff] sm:text-7xl">Payez</p>
              <p className="font-display text-2xl text-white/90">à votre rythme.</p>
              <div className="mt-6 h-1 w-40 rounded-full bg-gradient-to-r from-yellow-300 to-transparent" aria-hidden="true" />
            </div>
            <div>
              <SectionTitle kicker={settings.finance.name} title="Le paiement échelonné, simplement" />
              <ul className="space-y-3 text-[15px] text-black/75">
                <li className="flex gap-3"><WalletIcon className="h-6 w-6 shrink-0 text-orange-deep" /> Apport à partir de {settings.finance.minDownPct} % du prix, le reste en mensualités fixes.</li>
                <li className="flex gap-3"><CalendarIcon className="h-6 w-6 shrink-0 text-orange-deep" /> Durée au choix : {settings.finance.durations.join(", ")} mois.</li>
                <li className="flex gap-3"><CarIcon className="h-6 w-6 shrink-0 text-orange-deep" /> Vous roulez dès la signature, sur les véhicules du showroom comme sur commande.</li>
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/financement" className="btn-primary">Simuler mes mensualités</Link>
                <Link href="/voitures" className="btn-ghost">Voir les véhicules éligibles</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ARRIVAGE */}
      {arrivage.length > 0 && (
        <section aria-labelledby="arrivage" className="mx-auto max-w-7xl px-4 py-14">
          <SectionTitle
            kicker="Bientôt à Tana"
            id="arrivage"
            title="En cours d'arrivage"
            link={{ href: "/voitures?dispo=arrivage", label: "Tout l'arrivage" }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {arrivage.slice(0, 4).map((v) => <VehicleCard key={v.id} v={v} {...card} />)}
          </div>
        </section>
      )}

      {/* BRANDS */}
      <section aria-labelledby="marques" className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle kicker="Nos marques" id="marques" title="Spécialiste des marques coréennes" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {brandTiles.map((b) => {
            const n = brands.find((x) => x.value === b)?.n ?? 0;
            return (
              <li key={b}>
                <Link
                  href={`/voitures?marque=${encodeURIComponent(b)}`}
                  className="card flex h-full items-center justify-between gap-2 px-5 py-5 transition hover:border-cyan-deep hover:shadow-md"
                >
                  <span className="font-display text-xl font-semibold tracking-wide">{b}</span>
                  <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-muted">{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ON ORDER */}
      <section aria-labelledby="commande" className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionTitle dark kicker="Import sur commande" id="commande" title={<>Le modèle exact que vous voulez, <span className="text-orange">importé pour vous</span></>} />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Votre demande", d: "Marque, modèle, année, budget : dites-nous ce que vous cherchez." },
              { t: "Sélection en Corée", d: "Nous vous proposons des véhicules contrôlés, photos et historique à l'appui." },
              { t: "Acompte & expédition", d: `Vous validez avec un acompte de ${settings.orderDepositPct} %. Le véhicule est expédié vers Madagascar.` },
              { t: "Livraison à Tana", d: `Dédouané, immatriculé, prêt à rouler. Délai habituel : ${settings.orderDelay}.` },
            ].map((s, i) => (
              <li key={s.t} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <span className="font-display text-5xl font-bold text-cyan">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display mt-3 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-white/70">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sur-commande#demande" className="btn-primary">Faire ma demande</Link>
            {onOrder.length > 0 && (
              <Link href="/voitures?dispo=sur_commande" className="btn border border-white/25 text-white hover:border-white">
                Voir le catalogue sur commande ({onOrder.length})
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle kicker="Pourquoi Ediat Garage" title="Acheter l'esprit tranquille" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <ShipIcon className="h-6 w-6" />, t: "Import direct de Corée", d: "Pas d'intermédiaire caché : nous sélectionnons nous-mêmes chaque véhicule." },
            { icon: <ShieldIcon className="h-6 w-6" />, t: "Véhicules contrôlés", d: "Kilométrage, carrosserie, moteur et papiers vérifiés avant l'achat." },
            { icon: <DocIcon className="h-6 w-6" />, t: "Démarches incluses", d: "Dédouanement, visite technique et carte grise pris en charge." },
            { icon: <WalletIcon className="h-6 w-6" />, t: "Paiement souple", d: `${settings.finance.name} : apport puis mensualités fixes.` },
          ].map((x) => (
            <li key={x.t} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan-deep">{x.icon}</span>
              <h3 className="mt-4 font-semibold">{x.t}</h3>
              <p className="mt-1.5 text-sm text-black/65">{x.d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* SOLD */}
      {sold.length > 0 && (
        <section aria-labelledby="vendus" className="mx-auto max-w-7xl px-4 pb-14">
          <SectionTitle kicker="Ils roulent déjà" id="vendus" title="Récemment vendus" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sold.map((v) => <VehicleCard key={v.id} v={v} {...card} />)}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="bg-brand-gradient relative overflow-hidden rounded-[2rem] px-6 py-10 text-white sm:px-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/eg-mark.png" alt="" aria-hidden="true" className="absolute -right-6 -bottom-10 h-56 opacity-20" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Vous ne trouvez pas votre véhicule ?</h2>
            <p className="mt-3 text-white/90">
              Envoyez-nous le modèle et votre budget{listed.some((v) => v.price) ? ` (nos véhicules commencent à ${formatAr(Math.min(...listed.filter((v) => v.price).map((v) => v.price!)))})` : ""} :
              nous vous répondons sous 24 h avec des propositions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sur-commande#demande" className="btn-primary">Demander un véhicule</Link>
              <a
                href={waLink(settings.whatsapp, "Bonjour Ediat Garage, je cherche un véhicule : ")}
                target="_blank"
                rel="noopener"
                className="btn-whatsapp"
              >
                <WhatsAppIcon className="h-4 w-4" /> Écrire sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

