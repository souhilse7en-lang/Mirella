import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, numero_commande, status, montant_total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const statusLabel: Record<string, string> = {
    en_attente: "En attente",
    confirmée: "Confirmée",
    en_préparation: "En préparation",
    expédiée: "Expédiée",
    livrée: "Livrée",
    refusée: "Refusée",
  };
  const statusColor: Record<string, string> = {
    en_attente: "bg-yellow-100 text-yellow-800",
    confirmée: "bg-blue-100 text-blue-800",
    en_préparation: "bg-orange-100 text-orange-800",
    expédiée: "bg-purple-100 text-purple-800",
    livrée: "bg-green-100 text-green-800",
    refusée: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Mon compte</h1>
        <LogoutButton />
      </div>

      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <h2 className="font-medium mb-4">Informations</h2>
        <div className="space-y-1 text-sm">
          <p><span className="text-muted-foreground w-32 inline-block">Nom</span>{profile?.full_name || "—"}</p>
          <p><span className="text-muted-foreground w-32 inline-block">Email</span>{user.email}</p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl p-6">
        <h2 className="font-medium mb-4">Mes dernières commandes</h2>
        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{o.numero_commande}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status] ?? "bg-muted text-muted-foreground"}`}>
                  {statusLabel[o.status] ?? o.status}
                </span>
                <span className="font-medium">{Number(o.montant_total).toLocaleString("fr-FR")} DA</span>
                <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune commande pour le moment.</p>
        )}
      </div>
    </div>
  );
}
