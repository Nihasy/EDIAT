import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { SubmitButton } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth";
import { leadCounts } from "@/lib/leads";
import { logout } from "../actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: "Back-office", robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  const counts = await leadCounts();
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <Logo href="/admin" />
          <AdminNav newLeads={counts.nouveau ?? 0} />
          <form action={logout} className="ml-auto">
            <SubmitButton pendingLabel="Déconnexion…" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 hover:text-white">Déconnexion</SubmitButton>
          </form>
        </div>
        <div className="h-[3px] bg-[linear-gradient(90deg,var(--color-orange)_0_60%,var(--color-cyan)_60%_100%)]" aria-hidden="true" />
      </header>
      <main id="contenu" className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
