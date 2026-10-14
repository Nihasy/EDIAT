import type { LeadKind } from "@/lib/leads-shared";
import { CarIcon, KeyIcon, MailIcon, RefreshIcon, ShipIcon, WalletIcon } from "../Icons";

const ICONS: Record<LeadKind, (p: { className?: string }) => React.ReactNode> = {
  vehicule: CarIcon,
  essai: KeyIcon,
  sur_commande: ShipIcon,
  financement: WalletIcon,
  reprise: RefreshIcon,
  contact: MailIcon,
};

export function LeadKindIcon({ kind }: { kind: LeadKind }) {
  const Icon = ICONS[kind];
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan/10 text-cyan-deep" aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  );
}
