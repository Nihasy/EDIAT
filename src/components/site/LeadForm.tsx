"use client";

import { useEffect } from "react";
import { submitLead, type LeadState } from "@/app/actions";
import { waLink } from "@/lib/format";
import type { LeadKind } from "@/lib/leads-shared";
import { trackLead } from "@/lib/track";
import { useFormAction } from "../useFormAction";
import { Button } from "../ui/Button";
import { FormMessage } from "../ui/FormMessage";
import { CheckIcon } from "../Icons";
import { WhatsAppIcon } from "../WhatsAppIcon";

export type ExtraField =
  | { name: string; label: string; type?: "text" | "date" | "number"; placeholder?: string; defaultValue?: string; required?: boolean }
  | { name: string; label: string; options: string[]; defaultValue?: string; required?: boolean };

// Contact form shared by every public page. On success it offers to continue
// the conversation on WhatsApp, where most customers prefer to talk.
export function LeadForm({
  kind,
  vehicleId,
  extra = [],
  hidden = {},
  submitLabel = "Envoyer ma demande",
  messageLabel = "Votre message",
  messagePlaceholder,
  whatsapp,
  whatsappText,
  dark = false,
}: {
  kind: LeadKind;
  vehicleId?: number;
  extra?: ExtraField[];
  hidden?: Record<string, string>;
  submitLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  whatsapp: string;
  whatsappText: string;
  dark?: boolean;
}) {
  const [state, onSubmit, pending] = useFormAction<LeadState>(submitLead, undefined);
  const sent = Boolean(state?.ok);
  useEffect(() => {
    if (sent) trackLead(kind);
  }, [sent, kind]);

  if (state?.ok) {
    return (
      <div role="status" className={`rounded-2xl p-6 text-center ${dark ? "bg-white/10 text-white" : "bg-emerald-50 text-ink"}`}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <p className="font-display mt-3 text-2xl font-semibold">Merci{state.name ? ` ${state.name}` : ""} !</p>
        <p className={`mt-1 text-sm ${dark ? "text-white/80" : "text-black/70"}`}>
          Votre demande est bien reçue. Un conseiller Ediat Garage vous rappelle très vite.
        </p>
        <a href={waLink(whatsapp, whatsappText)} target="_blank" rel="noopener" className="btn-whatsapp mt-5">
          <WhatsAppIcon className="h-4 w-4" /> Continuer sur WhatsApp
        </a>
      </div>
    );
  }

  const field = dark ? "input border-white/20 bg-white/10 text-white placeholder:text-white/40" : "input";
  const label = dark ? "label text-white/70" : "label";
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2" noValidate>
      <input type="hidden" name="kind" value={kind} />
      {vehicleId && <input type="hidden" name="vehicle_id" value={vehicleId} />}
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="hidden" aria-hidden="true">
        <label>Site web <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div>
        <label className={label} htmlFor={`${kind}-name`}>Nom *</label>
        <input id={`${kind}-name`} name="name" required autoComplete="name" className={field} />
      </div>
      <div>
        <label className={label} htmlFor={`${kind}-phone`}>Téléphone / WhatsApp *</label>
        <input id={`${kind}-phone`} name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="034 12 345 67" className={field} />
      </div>
      {extra.map((f) => (
        <div key={f.name}>
          <label className={label} htmlFor={`${kind}-${f.name}`}>{f.label}{f.required ? " *" : ""}</label>
          {"options" in f ? (
            <select id={`${kind}-${f.name}`} name={f.name} defaultValue={f.defaultValue ?? ""} required={f.required} className={field}>
              <option value="">—</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              id={`${kind}-${f.name}`}
              name={f.name}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              defaultValue={f.defaultValue}
              required={f.required}
              className={field}
            />
          )}
        </div>
      ))}
      <div className="sm:col-span-2">
        <label className={label} htmlFor={`${kind}-message`}>{messageLabel}</label>
        <textarea id={`${kind}-message`} name="message" rows={3} placeholder={messagePlaceholder} className={field} />
      </div>
      <div className="sm:col-span-2">
        <FormMessage error={state?.error} />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" pending={pending} pendingLabel="Envoi…" className="btn-primary">{submitLabel}</Button>
        <p className={`text-xs ${dark ? "text-white/60" : "text-muted"}`}>Réponse sous 24 h ouvrées. Vos coordonnées restent chez Ediat Garage.</p>
      </div>
    </form>
  );
}
