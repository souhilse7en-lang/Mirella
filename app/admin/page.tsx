import { createClient } from "@/lib/supabase/server";
import { Package, FolderOpen, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";

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

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: productsCount },
    { count: collectionsCount },
    { count: ordersCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("collections").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders")
      .select("id, numero_commande, status, montant_total, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Produits",    value: productsCount ?? 0,    icon: Package,      href: "/admin/products" },
    { label: "Collections", value: collectionsCount ?? 0, icon: FolderOpen,   href: "/admin/collections" },
    { label: "Commandes",   value: ordersCount ?? 0,      icon: ShoppingCart, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-background rounded-xl border border-border p-6 flex items-center gap-4 hover:bg-muted/30 transition-colors">
            <div className="p-3 bg-muted rounded-lg">
              <Icon size={20} className="text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-background rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp size={16} />
          <h2 className="font-medium">Commandes récentes</h2>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-6 py-3 font-medium">N°</th>
                <th className="text-left px-6 py-3 font-medium">Statut</th>
                <th className="text-left px-6 py-3 font-medium">Total</th>
                <th className="text-left px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="contents">
                  <tr className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{order.numero_commande}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] ?? "bg-muted text-muted-foreground"}`}>
                        {statusLabel[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium">{Number(order.montant_total).toLocaleString("fr-FR")} DA</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-6 py-8 text-sm text-muted-foreground text-center">Aucune commande pour le moment.</p>
        )}
      </div>
    </div>
  );
}
