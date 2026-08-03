import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteProductButton from "./delete-button";

const TABS = [
  { key: "vetement",   label: "Vêtements",   newLabel: "Nouveau vêtement" },
  { key: "accessoire", label: "Accessoires",  newLabel: "Nouvel accessoire" },
  { key: "chaussure",  label: "Chaussures",   newLabel: "Nouvelle chaussure" },
] as const;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: typeParam } = await searchParams;
  const activeType = TABS.find((t) => t.key === typeParam)?.key ?? "vetement";
  const activeTab = TABS.find((t) => t.key === activeType)!;

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, is_active, is_featured, type_produit, collections(name)")
    .eq("type_produit", activeType)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Produits</h1>
        <Button asChild>
          <Link href={`/admin/products/new?type=${activeType}`}>
            <Plus size={16} className="mr-2" />
            {activeTab.newLabel}
          </Link>
        </Button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/products?type=${tab.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeType === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-background rounded-xl border border-border">
        {products && products.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-6 py-3 font-medium">Nom</th>
                <th className="text-left px-6 py-3 font-medium">Collection</th>
                <th className="text-left px-6 py-3 font-medium">Prix</th>
                <th className="text-left px-6 py-3 font-medium">Statut</th>
                <th className="text-left px-6 py-3 font-medium">Vedette</th>
                <th className="text-left px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {(p.collections as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-6 py-3">{Number(p.price).toLocaleString("fr-FR")} DA</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                      {p.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {p.is_featured
                      ? <span className="text-yellow-600 text-xs font-medium">★ Vedette</span>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${p.id}`}><Pencil size={14} /></Link>
                      </Button>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-6 py-12 text-sm text-muted-foreground text-center">
            Aucun {activeTab.label.toLowerCase().slice(0, -1)} pour le moment.{" "}
            <Link href={`/admin/products/new?type=${activeType}`} className="underline">
              Créer le premier
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
