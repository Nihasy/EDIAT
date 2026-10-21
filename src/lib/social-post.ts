import { fromMonthly, type FinanceSettings } from "./finance";
import { formatAr, formatKm, displayPhone } from "./format";
import { STATUSES, vehicleFullTitle, type Vehicle } from "./vehicle";

// Ready-to-paste Facebook / WhatsApp status text, in the tone of the page.
export function socialPost(v: Vehicle, s: { finance: FinanceSettings; whatsapp: string; orderDelay: string }, url: string) {
  const monthly = fromMonthly(v, s.finance);
  const lines = [
    `🚗 ${vehicleFullTitle(v).toUpperCase()}`,
    "",
    v.status === "showroom" ? "✅ DISPONIBLE AU SHOWROOM — dispo de suite !" : v.status === "arrivage" ? `🚢 EN ARRIVAGE${v.eta ? ` — arrivée ${v.eta}` : ""}, réservez-le !` : v.status === "sur_commande" ? `📦 SUR COMMANDE — délai ${v.eta || s.orderDelay}` : `ℹ️ ${STATUSES[v.status].label}`,
    "",
    [v.year && `📅 ${v.year}`, v.mileageKm != null && `🛣️ ${formatKm(v.mileageKm)}`, v.fuel && `⛽ ${v.fuel}`, v.gearbox && `⚙️ ${v.gearbox}`].filter(Boolean).join("  "),
    v.engine || v.drive ? `🔧 ${[v.engine, v.drive].filter(Boolean).join(" · ")}` : "",
    v.equipment.length ? `✨ ${v.equipment.slice(0, 6).join(", ")}` : "",
    "",
    v.price ? `💰 ${formatAr(v.price)}` : "💰 Prix sur demande",
    monthly ? `💳 ${s.finance.name} avec la ${s.finance.partner} : ROULEZ aujourd'hui, PAYEZ à votre rythme ! À partir de ${formatAr(monthly)} / mois*` : "",
    monthly ? `*Simulation ${s.finance.product} ${s.finance.partner}, sous réserve d'acceptation du dossier.` : "",
    "",
    `📲 WhatsApp : ${displayPhone(s.whatsapp)}`,
    `👉 ${url}`,
    "",
    `#EdiatGarage #${v.brand.replace(/\W/g, "")} #${v.model.replace(/\W/g, "")} #VoitureOccasion #Madagascar #Antananarivo`,
  ];
  return lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n").trim();
}
