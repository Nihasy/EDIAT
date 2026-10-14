"use client";

import { SubmitButton } from "@/components/ui/Button";

export function ConfirmDelete({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Supprimer définitivement ce véhicule ? (Pour le garder en historique, passez-le plutôt en « Vendu ».)")) e.preventDefault();
      }}
    >
      <SubmitButton pendingLabel="Suppression…" className="btn w-full text-red-700 hover:bg-red-50">Supprimer</SubmitButton>
    </form>
  );
}
