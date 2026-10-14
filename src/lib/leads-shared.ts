// Requests sent from the public forms (client-safe definitions).

export const LEAD_KINDS = {
  vehicule: { label: "Intérêt pour un véhicule", icon: "🚗" },
  essai: { label: "Demande d'essai / visite", icon: "🔑" },
  sur_commande: { label: "Recherche sur commande", icon: "🚢" },
  financement: { label: "Demande Ediat Facility", icon: "💳" },
  reprise: { label: "Reprise de véhicule", icon: "🔁" },
  contact: { label: "Message", icon: "✉️" },
} as const;

export type LeadKind = keyof typeof LEAD_KINDS;

export function isLeadKind(v: unknown): v is LeadKind {
  return typeof v === "string" && v in LEAD_KINDS;
}

export const LEAD_STATUSES = {
  nouveau: { label: "Nouveau", tone: "orange" },
  en_cours: { label: "En cours", tone: "cyan" },
  gagne: { label: "Conclu", tone: "green" },
  perdu: { label: "Sans suite", tone: "grey" },
} as const;

export type LeadStatus = keyof typeof LEAD_STATUSES;

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === "string" && v in LEAD_STATUSES;
}

// Labels of the extra fields a form may send (stored in "details").
export const DETAIL_LABELS: Record<string, string> = {
  marque: "Marque",
  modele: "Modèle",
  annee_min: "Année min.",
  km_max: "Km max.",
  budget: "Budget",
  carburant: "Carburant",
  boite: "Boîte",
  date: "Date souhaitée",
  apport: "Apport",
  duree: "Durée",
  mensualite: "Mensualité estimée",
  vehicule_client: "Véhicule à reprendre",
  sujet: "Sujet",
};

export type Lead = {
  id: number;
  kind: LeadKind;
  vehicleId: number | null;
  vehicleLabel: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  details: Record<string, string>;
  status: LeadStatus;
  adminNote: string;
  createdAt: string;
};
