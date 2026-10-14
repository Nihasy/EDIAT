import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { pageParam } from "@/lib/pagination";
import { leadCounts, listLeads } from "@/lib/leads";
import { isLeadKind, isLeadStatus, LEAD_KINDS, LEAD_STATUSES } from "@/lib/leads-shared";
import { LeadItem } from "./LeadItem";

const SIZE = 30;

export default async function LeadsAdmin(props: PageProps<"/admin/demandes">) {
  const sp = await props.searchParams;
  const statut = isLeadStatus(sp.statut) ? sp.statut : undefined;
  const type = isLeadKind(sp.type) ? sp.type : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const page = pageParam(sp.page);
  const [{ items, total }, counts] = await Promise.all([
    listLeads({ status: statut, kind: type, q: q || undefined, limit: SIZE, offset: (page - 1) * SIZE }),
    leadCounts(),
  ]);
  const all = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  const href = (changes: Record<string, string>) => {
    const p = new URLSearchParams({ ...(statut ? { statut } : {}), ...(type ? { type } : {}), ...(q ? { q } : {}), ...changes });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return `/admin/demandes${p.size ? `?${p}` : ""}`;
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Demandes clients</h1>
      <p className="mt-1 text-sm text-muted">Tous les formulaires du site arrivent ici : intérêt, essai, import sur commande, financement, reprise, contact.</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link href={href({ statut: "", page: "" })} aria-current={!statut ? "page" : undefined} className={`flex min-h-11 items-center rounded-full px-3.5 text-sm ${!statut ? "bg-ink font-semibold text-white" : "bg-white hover:bg-black/5"}`}>
          Toutes <span className="opacity-60">{all}</span>
        </Link>
        {(Object.keys(LEAD_STATUSES) as (keyof typeof LEAD_STATUSES)[]).map((s) => (
          <Link key={s} href={href({ statut: s, page: "" })} aria-current={statut === s ? "page" : undefined} className={`flex min-h-11 items-center rounded-full px-3.5 text-sm ${statut === s ? "bg-ink font-semibold text-white" : "bg-white hover:bg-black/5"}`}>
            {LEAD_STATUSES[s].label} <span className="opacity-60">{counts[s] ?? 0}</span>
          </Link>
        ))}
        <form className="ml-auto flex w-full gap-2 sm:w-auto">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <select name="type" defaultValue={type ?? ""} className="input sm:w-48" aria-label="Type de demande">
            <option value="">Tous les types</option>
            {(Object.keys(LEAD_KINDS) as (keyof typeof LEAD_KINDS)[]).map((k) => <option key={k} value={k}>{LEAD_KINDS[k].label}</option>)}
          </select>
          <input name="q" defaultValue={q} placeholder="Nom, téléphone, véhicule…" aria-label="Rechercher" className="input sm:w-56" />
          <button className="btn-dark">OK</button>
        </form>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((l) => <LeadItem key={l.id} lead={l} />)}
      </ul>
      {!items.length && <p className="card mt-5 p-8 text-center text-muted">Aucune demande.</p>}
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / SIZE))} hrefFor={(p) => href({ page: p > 1 ? String(p) : "" })} />
    </div>
  );
}
