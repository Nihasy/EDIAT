import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-bold text-orange-deep">404</p>
      <h1 className="font-display mt-2 text-3xl font-semibold">Ce véhicule a peut-être déjà trouvé preneur</h1>
      <p className="mt-3 text-muted">La page demandée n&apos;existe pas ou plus.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/voitures" className="btn-primary">Voir nos véhicules</Link>
        <Link href="/sur-commande" className="btn-ghost">Le faire importer</Link>
      </div>
    </div>
  );
}
