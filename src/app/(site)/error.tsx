"use client";

import Link from "next/link";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Oups, un souci de chargement</h1>
      <p className="mt-3 text-muted">Vérifiez votre connexion et réessayez.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">Réessayer</button>
        <Link href="/" className="btn-ghost">Accueil</Link>
      </div>
    </div>
  );
}
