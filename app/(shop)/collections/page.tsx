import { createClient } from "@/lib/supabase/server";
import CollectionCard from "@/components/shop/collection-card";

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, image_url, description")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-semibold tracking-tight mb-2">Collections</h1>
      <p className="text-muted-foreground mb-12">Explorez nos univers et trouvez les pièces qui vous ressemblent.</p>

      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c) => (
            <CollectionCard key={c.id} name={c.name} slug={c.slug} image_url={c.image_url} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-24">Aucune collection disponible pour le moment.</p>
      )}
    </div>
  );
}
