import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/shop/product-card";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, description, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!collection) notFound();

  const { data: products } = await supabase
    .from("products")
    .select(`id, name, slug, price, compare_price, is_featured, disponibilite, product_images(url, is_primary, sort_order), product_variants(color, color_hex, image_url)`)
    .eq("collection_id", collection.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* Header collection */}
      <div className="relative h-72 flex items-end" style={{ backgroundColor: "#F0E8ED" }}>
        {collection.image_url && (
          <Image src={collection.image_url} alt={collection.name} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-10 w-full">
          <h1 className="text-4xl font-semibold text-white">{collection.name}</h1>
          {collection.description && <p className="text-white/80 mt-2">{collection.description}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                compare_price={p.compare_price}
                is_featured={p.is_featured}
                disponibilite={(p as { disponibilite?: string }).disponibilite ?? "stock"}
                images={p.product_images as { url: string; is_primary: boolean; sort_order?: number }[]}
                variants={p.product_variants as { color: string; color_hex: string; image_url?: string | null }[]}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-24" style={{ color: "#9B6B76" }}>Aucun produit dans cette collection pour le moment.</p>
        )}
      </div>
    </div>
  );
}
