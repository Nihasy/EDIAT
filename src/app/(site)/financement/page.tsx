import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CheckIcon } from "@/components/Icons";
import { Rail } from "@/components/site/Rail";
import { SectionTitle } from "@/components/site/SectionTitle";
import { VehicleCard } from "@/components/VehicleCard";
import { publicVehicles, siteSettings } from "@/lib/catalog";
import { fromMonthly } from "@/lib/finance";
import { formatAr, formatNumber } from "@/lib/format";
import { pageMeta } from "@/lib/seo";
import { FinanceRequest } from "./FinanceRequest";


export async function generateMetadata(): Promise<Metadata> {
  const s = await siteSettings();
  return pageMeta({
    title: `Crédit voiture d'occasion à Antananarivo — ${s.finance.name}`,
    description: `Financez votre voiture d'occasion avec le ${s.finance.product} de la ${s.finance.partner}, notre partenaire : simulation en ligne, mensualités fixes jusqu'à ${Math.max(...s.finance.durations)} mois.`,
    path: "/financement",
  });
}

export default async function FinancePage() {
  await connection();
  const [settings, all] = await Promise.all([siteSettings(), publicVehicles()]);
  const f = settings.finance;
  if (!f.enabled) notFound();
  const eligible = all
    .filter((v) => (v.status === "showroom" || v.status === "arrivage") && fromMonthly(v, f))
    .sort((a, b) => fromMonthly(a, f)! - fromMonthly(b, f)!)
    .slice(0, 10);

  return (
    <>
      <section className="bg-swirl overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-cyan-deep uppercase">{f.name}</p>
            <h1 className="font-display mt-3 text-5xl leading-[0.95] font-bold sm:text-7xl">
              Roulez <span className="text-3xl font-semibold text-black/60 sm:text-4xl">aujourd&apos;hui</span>
              <br />
              <span className="text-orange-deep">Payez</span> <span className="text-3xl font-semibold text-black/60 sm:text-4xl">à votre rythme.</span>
            </h1>
            <ul className="mt-6 space-y-2 text-[15px]">
              {[
                `${f.product} de la ${f.partner}, notre partenaire bancaire`,
                `Prêt de ${formatAr(f.minLoan)} à ${formatAr(f.maxLoan)}`,
                `Mensualités fixes sur ${f.durations.join(", ")} mois`,
                f.minDownPct > 0 ? `Apport à partir de ${f.minDownPct} % du prix` : `Frais de dossier ${formatNumber(f.feePct)} %, inclus dans le prêt`,
              ].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckIcon className="h-5 w-5 text-cyan-deep" /> {t}</li>
              ))}
            </ul>
          </div>
          {/* Brand visual: orange and blue halves, logo card, partnership tags. */}
          <div className="relative hidden aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-[linear-gradient(125deg,#ef7d2e_0%,#d4441c_48%,#00799a_52%,#00add7_100%)] lg:flex">
            <div className="relative w-4/5 overflow-hidden rounded-[2rem] bg-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.35)]">
              <div className="px-10 pt-10 pb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/ediat-logo-lg.webp" alt="Ediat Garage" width={1200} height={502} loading="lazy" className="w-full" />
                <p className="mt-5 text-center text-sm font-semibold tracking-[0.2em] text-black/55 uppercase">en partenariat avec la {f.partner}</p>
              </div>
              <div className="h-2 bg-[linear-gradient(90deg,var(--color-orange)_0_60%,var(--color-cyan)_60%_100%)]" aria-hidden="true" />
            </div>
            <div className="relative mt-6 flex flex-wrap justify-center gap-2 text-sm font-semibold text-white">
              <span className="rounded-full bg-ink px-4 py-2">{f.product}</span>
              <span className="rounded-full bg-ink px-4 py-2">Jusqu&apos;à {Math.max(...f.durations)} mois</span>
              <span className="rounded-full bg-white/20 px-4 py-2">Frais {formatNumber(f.feePct)} % inclus</span>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal mx-auto max-w-7xl px-4 py-12">
        <FinanceRequest settings={f} whatsapp={settings.whatsapp} />
      </section>

      <section className="reveal mx-auto max-w-7xl px-4 pb-12">
        <SectionTitle kicker="Comment ça marche" title={`${f.name} en 4 étapes`} />
        <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Choisissez", "Showroom, arrivage ou commande."],
            ["Simulez", "Apport et durée."],
            ["Constituez le dossier", `Avec nous, pour la ${f.partner} : CIN, RCS / NIF / STAT, statuts.`],
            ["Roulez", `Et remboursez la ${f.partner} chaque mois.`],
          ].map(([t, d], i) => (
            <li key={t} className="card p-4 sm:p-6">
              <span className="font-display text-4xl font-bold text-orange">{i + 1}</span>
              <h3 className="font-display mt-2 text-xl font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-black/70">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {eligible.length > 0 && (
        <Rail id="eligibles" kicker="Petites mensualités" title={`Avec ${f.name}`} href="/voitures">
          {eligible.map((v) => <VehicleCard key={v.id} v={v} finance={f} orderDelay={settings.orderDelay} />)}
        </Rail>
      )}

      <p className="mx-auto max-w-7xl px-4 pb-12 text-xs text-muted">
        {f.conditions} <Link href="/contact" className="underline">Une question ?</Link>
      </p>
    </>
  );
}
