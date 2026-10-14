"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h1 className="font-display text-2xl font-semibold">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-muted">{error.message || "Réessayez dans un instant."}</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">Réessayer</button>
    </div>
  );
}
