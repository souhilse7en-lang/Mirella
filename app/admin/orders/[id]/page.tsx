import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import UpdateStatusButton from "./update-status";

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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*, wilayas(nom), communes(nom)").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (!order) notFound();

  const wilayaNom  = (order.wilayas  as { nom: string } | null)?.nom ?? `Wilaya ${order.client_wilaya_id}`;
  const communeNom = (order.communes as { nom: string } | null)?.nom ?? null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Commande</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{order.numero_commande}</p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColor[order.status] ?? "bg-muted text-muted-foreground"}`}>
          {statusLabel[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-background border border-border rounded-xl p-5">
          <h2 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">Client</h2>
          <p className="font-medium">{order.client_nom}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{order.client_telephone}</p>
          <p className="text-sm mt-2">{order.client_adresse}</p>
          <p className="text-sm text-muted-foreground">
            {wilayaNom}{communeNom && ` — ${communeNom}`}
          </p>
          <p className="text-sm mt-1">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${order.type_livraison === "domicile" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}`}>
              {order.type_livraison === "domicile" ? "Livraison à domicile" : "Retrait Stop Desk"}
            </span>
          </p>
        </div>
        <div className="bg-background border border-border rounded-xl p-5">
          <h2 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">Résumé</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{new Date(order.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produits</span>
              <span>{Number(order.montant_produits).toLocaleString("fr-FR")} DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span>{Number(order.frais_livraison).toLocaleString("fr-FR")} DA</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-1.5 mt-1.5">
              <span>Total</span>
              <span>{Number(order.montant_total).toLocaleString("fr-FR")} DA</span>
            </div>
          </div>
          {order.notes && (
            <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">{order.notes}</p>
          )}
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl mb-6">
        <h2 className="px-6 py-4 font-medium border-b border-border text-sm uppercase tracking-wide text-muted-foreground">Articles</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-6 py-3 font-medium">Produit</th>
              <th className="text-left px-6 py-3 font-medium">Taille</th>
              <th className="text-left px-6 py-3 font-medium">Couleur</th>
              <th className="text-left px-6 py-3 font-medium">Qté</th>
              <th className="text-left px-6 py-3 font-medium">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-6 py-3 font-medium">{item.product_name}</td>
                <td className="px-6 py-3">{item.size}</td>
                <td className="px-6 py-3 text-muted-foreground">{item.color || "—"}</td>
                <td className="px-6 py-3">{item.quantity}</td>
                <td className="px-6 py-3 font-medium">
                  {(item.quantity * Number(item.unit_price)).toLocaleString("fr-FR")} DA
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-background border border-border rounded-xl p-5">
        <h2 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Modifier le statut</h2>
        <UpdateStatusButton orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  );
}
