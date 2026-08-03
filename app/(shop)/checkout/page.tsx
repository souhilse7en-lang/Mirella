import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: wilayas } = await supabase
    .from("wilayas")
    .select("id, nom, frais_livraison_domicile, frais_livraison_stopdesk, delai_estime_jours")
    .order("id");

  return <CheckoutForm wilayas={wilayas ?? []} />;
}
