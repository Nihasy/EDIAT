import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-bold">Paramètres</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
