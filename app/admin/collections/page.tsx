import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteCollectionButton from "./delete-button";

export default async function AdminCollectionsPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, is_active, sort_order, created_at")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Collections</h1>
        <Button asChild>
          <Link href="/admin/collections/new"><Plus size={16} className="mr-2" />Nouvelle collection</Link>
        </Button>
      </div>

      <div className="bg-background rounded-xl border border-border">
        {collections && collections.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-6 py-3 font-medium">Nom</th>
                <th className="text-left px-6 py-3 font-medium">Slug</th>
                <th className="text-left px-6 py-3 font-medium">Statut</th>
                <th className="text-left px-6 py-3 font-medium">Ordre</th>
                <th className="text-left px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3 font-medium">{c.name}</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{c.sort_order}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/collections/${c.id}`}><Pencil size={14} /></Link>
                      </Button>
                      <DeleteCollectionButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-6 py-12 text-sm text-muted-foreground text-center">
            Aucune collection. <Link href="/admin/collections/new" className="underline">Créer la première</Link>
          </p>
        )}
      </div>
    </div>
  );
}
