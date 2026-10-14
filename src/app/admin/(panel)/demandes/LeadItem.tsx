"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeLead, saveLead } from "@/app/admin/actions";
import { LeadKindIcon } from "@/components/admin/LeadKindIcon";
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge";
import { PhoneIcon } from "@/components/Icons";
import { Spinner } from "@/components/ui/Spinner";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { displayPhone, formatDateTime, telLink, waLink } from "@/lib/format";
import { DETAIL_LABELS, LEAD_KINDS, LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/leads-shared";

export function LeadItem({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [note, setNote] = useState(lead.adminNote);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState("");
  const save = (s: LeadStatus, n: string) =>
    start(async () => {
      const res = await saveLead(lead.id, s, n);
      setSaved(res?.error ?? "Enregistré ✓");
      router.refresh();
    });
  const reply = `Bonjour ${lead.name}, c'est Ediat Garage. Merci pour votre demande${lead.vehicleLabel ? ` concernant le ${lead.vehicleLabel}` : ""}. `;

  return (
    <li id={`d${lead.id}`} className={`card scroll-mt-24 p-4 sm:p-5 ${lead.status === "nouveau" ? "border-l-4 border-l-orange" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2">
            <LeadKindIcon kind={lead.kind} />
            <strong className="text-lg">{lead.name}</strong>
            <LeadStatusBadge status={lead.status} />
          </p>
          <p className="text-sm text-muted">{LEAD_KINDS[lead.kind].label} · {formatDateTime(lead.createdAt)}</p>
          {lead.vehicleLabel && (
            <p className="mt-1 text-sm">
              {lead.vehicleId ? <Link href={`/admin/vehicules/${lead.vehicleId}`} className="font-semibold text-cyan-deep hover:underline">{lead.vehicleLabel}</Link> : lead.vehicleLabel}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <a href={telLink(lead.phone)} className="btn-ghost px-3 py-2"><PhoneIcon className="h-4 w-4" /> {displayPhone(lead.phone)}</a>
          <a
            href={waLink(lead.phone, reply)}
            target="_blank"
            rel="noopener"
            onClick={() => { if (status === "nouveau") { setStatus("en_cours"); save("en_cours", note); } }}
            className="btn-whatsapp px-3 py-2"
          >
            <WhatsAppIcon className="h-4 w-4" /> Répondre
          </a>
        </div>
      </div>
      {(Object.keys(lead.details).length > 0 || lead.message || lead.email) && (
        <div className="mt-3 rounded-xl bg-paper p-3 text-sm">
          {Object.keys(lead.details).length > 0 && (
            <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {Object.entries(lead.details).map(([k, v]) => (
                <div key={k} className="flex gap-2"><dt className="text-muted">{DETAIL_LABELS[k] ?? k} :</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          )}
          {lead.email && <p className="mt-1"><span className="text-muted">E-mail :</span> <a href={`mailto:${lead.email}`} className="text-cyan-deep">{lead.email}</a></p>}
          {lead.message && <p className="mt-2 whitespace-pre-line">{lead.message}</p>}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          aria-label="Statut de la demande"
          value={status}
          disabled={pending}
          onChange={(e) => { const s = e.target.value as LeadStatus; setStatus(s); save(s, note); }}
          className="min-h-11 rounded-lg border border-black/15 bg-white px-2 text-sm"
        >
          {(Object.keys(LEAD_STATUSES) as LeadStatus[]).map((s) => <option key={s} value={s}>{LEAD_STATUSES[s].label}</option>)}
        </select>
        <input
          aria-label="Note interne"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== lead.adminNote && save(status, note)}
          placeholder="Note interne (rappelé le…, budget…)"
          className="input min-w-0 flex-1 py-2"
        />
        <span className="flex w-24 items-center gap-1 text-xs text-muted" aria-live="polite">{pending ? <Spinner /> : saved}</span>
        <button
          type="button"
          onClick={() => {
            if (!confirm("Supprimer cette demande ?")) return;
            start(async () => { await removeLead(lead.id); router.refresh(); });
          }}
          className="min-h-11 px-2 text-sm text-red-700 hover:underline"
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}
