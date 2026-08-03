import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusLabel: Record<string, string> = {
  en_attente:     "En attente",
  confirmée:      "Confirmée",
  en_préparation: "En préparation",
  expédiée:       "Expédiée",
  livrée:         "Livrée",
  refusée:        "Refusée",
};
const statusColor: Record<string, string> = {
  en_attente:     "bg-yellow-100 text-yellow-800",
  confirmée:      "bg-blue-100 text-blue-800",
  en_préparation: "bg-orange-100 text-orange-800",
  expédiée:       "bg-purple-100 text-purple-800",
  livrée:         "bg-green-100 text-green-800",
  refusée:        "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, numero_commande, status, montant_total, client_nom, client_wilaya_id, wilayas(nom), communes(nom), created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Commandes</h1>
      <div className="bg-background rounded-xl border border-border">
        {orders && orders.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-6 py-3 font-medium">N°</th>
                <th className="text-left px-6 py-3 font-medium">Client</th>
                <th className="text-left px-6 py-3 font-medium">Wilaya / Commune</th>
                <th className="text-left px-6 py-3 font-medium">Total</th>
                <th className="text-left px-6 py-3 font-medium">Statut</th>
                <th className="text-left px-6 py-3 font-medium">Date</th>
                <th className="text-left px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{o.numero_commande}</td>
                  <td className="px-6 py-3 font-medium">{o.client_nom}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    <span>{(o.wilayas as unknown as { nom: string } | null)?.nom ?? `W${o.client_wilaya_id}`}</span>
                    {(o.communes as unknown as { nom: string } | null)?.nom && (
                      <span className="block text-xs text-muted-foreground/70">
                        {(o.communes as unknown as { nom: string }).nom}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 font-medium">{Number(o.montant_total).toLocaleString("fr-FR")} DA</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status] ?? "bg-muted text-muted-foreground"}`}>
                      {statusLabel[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-6 py-3">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/orders/${o.id}`}><Eye size={14} /></Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-6 py-12 text-sm text-muted-foreground text-center">Aucune commande pour le moment.</p>
        )}
      </div>
    </div>
  );
}
