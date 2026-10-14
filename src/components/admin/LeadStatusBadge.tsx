import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads-shared";

const TONES = {
  orange: "bg-orange/15 text-orange-deep",
  cyan: "bg-cyan/15 text-cyan-deep",
  green: "bg-emerald-100 text-emerald-800",
  grey: "bg-black/5 text-black/60",
} as const;

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const s = LEAD_STATUSES[status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${TONES[s.tone]}`}>{s.label}</span>;
}
