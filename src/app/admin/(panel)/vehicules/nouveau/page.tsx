import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { VehicleForm } from "../VehicleForm";

export default async function NewVehicle() {
  const settings = await getSettings();
  return (
    <div>
      <Link href="/admin/vehicules" className="text-sm text-muted hover:text-ink">← Véhicules</Link>
      <h1 className="font-display mt-1 mb-6 text-3xl font-bold">Nouveau véhicule</h1>
      <VehicleForm finance={settings.finance} orderDelay={settings.orderDelay} />
    </div>
  );
}
