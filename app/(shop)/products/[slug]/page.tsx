import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductClientView from "./product-client-view";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      collections(name, slug),
      product_images(url, alt, is_primary, sort_order),
      product_variants(id, size, color, color_hex, stock, image_url)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const images = (product.product_images as { url: string; alt: string; is_primary: boolean; sort_order: number }[])
    ?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

  const variants = (product.product_variants as {
    id: string; size: string; color: string; color_hex: string; stock: number; image_url?: string | null;
  }[]) ?? [];

  const collection = product.collections as { name: string; slug: string } | null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <ProductClientView
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          compare_price: product.compare_price,
          description: product.description,
        }}
        variants={variants}
        images={images}
        typeProduit={product.type_produit ?? "vetement"}
        collection={collection}
      />
    </div>
  );
}
