import { createClient } from "@/lib/supabase/server";
import WilayasTable from "./wilayas-table";

export const metadata = { title: "Tarifs de livraison — Admin Mirella" };

export default async function WilayasPage() {
  const supabase = await createClient();
  const { data: wilayas } = await supabase
    .from("wilayas")
    .select("id, nom, frais_livraison_domicile, frais_livraison_stopdesk, delai_estime_jours")
    .order("id");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Tarifs de livraison</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cliquez sur un montant ou un délai pour le modifier directement.
        </p>
      </div>
      <WilayasTable wilayas={wilayas ?? []} />
    </div>
  );
}
