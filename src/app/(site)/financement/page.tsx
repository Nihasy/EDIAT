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
import { FinanceRequest } from "./FinanceRequest";


export async function generateMetadata(): Promise<Metadata> {
  const s = await siteSettings();
  return {
    title: `${s.finance.name} — Roulez aujourd'hui, payez à votre rythme`,
    description: `Achetez votre véhicule d'occasion avec un apport de ${s.finance.minDownPct} % et des mensualités fixes sur ${s.finance.durations.join(", ")} mois.`,
  };
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
                `Apport à partir de ${f.minDownPct} % du prix`,
                `Durées : ${f.durations.join(", ")} mois`,
                f.annualRatePct > 0 ? "Mensualités fixes, connues dès le départ" : "Sans intérêts",
                "Réponse rapide, dossier simple",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckIcon className="h-5 w-5 text-cyan-deep" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-orange-gradient relative hidden aspect-[4/3] items-center justify-center overflow-hidden rounded-[2.5rem] shadow-2xl lg:flex">
            <span className="font-display absolute -top-10 right-10 text-[260px] leading-none text-white/90" aria-hidden="true">!</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/eg-mark.png" alt="" className="relative h-3/4 drop-shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <FinanceRequest settings={f} whatsapp={settings.whatsapp} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <SectionTitle kicker="Comment ça marche" title={`${f.name} en 4 étapes`} />
        <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Choisissez", "Showroom, arrivage ou commande."],
            ["Simulez", "Apport et durée."],
            ["Signez", "CIN, domicile, revenus."],
            ["Roulez", "Et payez chaque mois."],
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
