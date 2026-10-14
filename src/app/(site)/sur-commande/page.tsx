import type { Metadata } from "next";
import { DocIcon, ShieldIcon, ShipIcon, KeyIcon } from "@/components/Icons";
import { LeadForm } from "@/components/site/LeadForm";
import { Rail } from "@/components/site/Rail";
import { SectionTitle } from "@/components/site/SectionTitle";
import { VehicleCard } from "@/components/VehicleCard";
import { publicVehicles, siteSettings } from "@/lib/catalog";
import { BODIES, BRANDS, FUELS, GEARBOXES } from "@/lib/vehicle";

export const metadata: Metadata = {
  title: "Import sur commande depuis la Corée",
  description: "Faites importer le véhicule d'occasion de votre choix depuis la Corée : sélection, contrôle, expédition, dédouanement et carte grise par Ediat Garage.",
};

export default async function OnOrderPage(props: PageProps<"/sur-commande">) {
  const sp = await props.searchParams;
  const pre = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).slice(0, 60) : undefined);
  const [settings, all] = await Promise.all([siteSettings(), publicVehicles()]);
  const catalogue = all.filter((v) => v.status === "sur_commande").slice(0, 10);

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
          <p className="text-sm font-bold tracking-[0.2em] text-cyan uppercase">Import sur commande</p>
          <h1 className="font-display mt-3 max-w-3xl text-5xl leading-[0.95] font-bold sm:text-6xl">
            Le véhicule que vous voulez, <span className="text-orange">importé de Corée pour vous.</span>
          </h1>
          <p className="mt-4 text-lg text-white/80">Délai habituel : <strong className="text-white">{settings.orderDelay}</strong></p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#demande" className="btn-primary">Faire ma demande</a>
            {catalogue.length > 0 && <a href="#catalogue" className="btn border border-white/25 text-white hover:border-white">Voir des exemples</a>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle kicker="Étape par étape" title="Comment se passe une commande" />
        <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: <DocIcon className="h-6 w-6" />, t: "1. Votre cahier des charges", d: "Modèle, année, budget. Gratuit." },
            { icon: <ShieldIcon className="h-6 w-6" />, t: "2. Propositions contrôlées", d: "Photos et rapport d'état des véhicules trouvés." },
            { icon: <ShipIcon className="h-6 w-6" />, t: `3. Acompte de ${settings.orderDepositPct} % & expédition`, d: "Vous validez, on achète et on expédie." },
            { icon: <KeyIcon className="h-6 w-6" />, t: "4. Remise des clés", d: "Dédouané, immatriculé, prêt à rouler." },
          ].map((s) => (
            <li key={s.t} className="card p-4 sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange/10 text-orange-deep">{s.icon}</span>
              <h3 className="font-display mt-3 text-lg leading-tight font-semibold sm:text-xl">{s.t}</h3>
              <p className="mt-1.5 text-sm text-black/70">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="demande" className="scroll-mt-24 bg-swirl">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionTitle kicker="Recherche personnalisée" title="Décrivez votre futur véhicule" />
            <p className="text-black/75">Réponse sous 24 h ouvrées.</p>
            <ul className="mt-6 space-y-3 text-sm text-black/75">
              <li>✔ Spécialistes Hyundai, Kia, SsangYong, Daewoo, Chevrolet…</li>
              <li>✔ Prix tout compris annoncé avant l&apos;acompte</li>
              <li>✔ Paiement échelonné possible avec {settings.finance.name}</li>
            </ul>
          </div>
          <div className="card p-5 sm:p-7">
            <LeadForm
              kind="sur_commande"
              extra={[
                { name: "marque", label: "Marque", options: BRANDS, defaultValue: pre("marque"), required: true },
                { name: "modele", label: "Modèle", placeholder: "Tucson, Sorento, Rexton…", defaultValue: pre("modele") },
                { name: "annee_min", label: "Année minimum", type: "number", placeholder: "2015" },
                { name: "budget", label: "Budget (Ar)", placeholder: "45 000 000" },
                { name: "carburant", label: "Carburant", options: FUELS },
                { name: "boite", label: "Boîte", options: GEARBOXES },
              ]}
              messageLabel="Précisions (couleur, options, type…)"
              messagePlaceholder={`Ex. ${BODIES[0]} 7 places, toit ouvrant, couleur claire`}
              submitLabel="Envoyer ma recherche"
              whatsapp={settings.whatsapp}
              whatsappText="Bonjour Ediat Garage, je viens d'envoyer une demande d'import sur commande depuis le site."
            />
          </div>
        </div>
      </section>

      {catalogue.length > 0 && (
        <div id="catalogue" className="scroll-mt-24">
          <Rail id="catalogue-titre" kicker="Exemples à importer" title="Catalogue sur commande" href="/voitures?dispo=sur_commande">
            {catalogue.map((v) => <VehicleCard key={v.id} v={v} finance={settings.finance} orderDelay={settings.orderDelay} />)}
          </Rail>
        </div>
      )}

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <SectionTitle kicker="Questions fréquentes" title="Bon à savoir" />
        <div className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
          {[
            ["Combien de temps faut-il ?", `En général ${settings.orderDelay} entre l'acompte et la remise des clés, selon les bateaux et le dédouanement.`],
            ["Le prix annoncé comprend quoi ?", "Le véhicule, le transport jusqu'à Madagascar, le dédouanement et les démarches de carte grise. Tout est détaillé avant l'acompte."],
            ["Et si le véhicule ne me plaît pas ?", "Vous validez sur photos et rapport d'état avant l'achat. Tant que vous n'avez pas validé, rien n'est acheté."],
            ["Puis-je payer en plusieurs fois ?", `Oui : avec ${settings.finance.name}, apport puis mensualités, y compris pour une commande.`],
            ["Les véhicules sont-ils à volant à gauche ?", "Oui, uniquement des véhicules conduite à gauche, conformes à l'immatriculation à Madagascar."],
          ].map(([q, a]) => (
            <details key={q} className="group px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold">
                {q} <span className="text-orange-deep transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="pb-4 text-[15px] text-black/70">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
