"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";

// Every catalogue control (filters, availability chips, sort, pagination)
// navigates through the same transition, so the results can show that they
// are updating instead of freezing.
const Ctx = createContext<{ pending: boolean; navigate: (href: string) => void } | null>(null);

export function CatalogNav({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const navigate = (href: string) => start(() => router.push(href, { scroll: false }));
  return <Ctx.Provider value={{ pending, navigate }}>{children}</Ctx.Provider>;
}

export function useCatalogNav() {
  const router = useRouter();
  const ctx = useContext(Ctx);
  return ctx ?? { pending: false, navigate: (href: string) => router.push(href, { scroll: false }) };
}

// Results: dimmed with a floating "updating" pill while the next list loads.
export function PendingResults({ children }: { children: React.ReactNode }) {
  const { pending } = useCatalogNav();
  return (
    <div aria-busy={pending} className="relative">
      <div className={`transition-opacity duration-200 ${pending ? "opacity-40" : ""}`}>{children}</div>
      {pending && (
        <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex justify-center">
          <span role="status" className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lg">
            <Spinner /> Mise à jour…
          </span>
        </div>
      )}
    </div>
  );
}

// Availability chips of the toolbar.
export function NavChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  const { navigate } = useCatalogNav();
  return (
    <a
      href={href}
      aria-current={active ? "true" : undefined}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      className={`flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold ring-1 transition-colors duration-200 ${active ? "bg-orange-deep text-white ring-orange-deep" : "bg-white ring-black/10 hover:ring-ink"}`}
    >
      {children}
    </a>
  );
}
