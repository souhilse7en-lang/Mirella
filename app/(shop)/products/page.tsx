import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/shop/product-card";
import Link from "next/link";

const PAGE_SIZE = 12;

const TYPE_META: Record<string, { title: string; subtitle: string }> = {
  accessoire: { title: "Accessoires",  subtitle: "Bijoux · Parfums · Foulards" },
  chaussure:  { title: "Chaussures",   subtitle: "Sandales · Escarpins · Sneakers" },
  vetement:   { title: "Vêtements",    subtitle: "Robes · Ensembles · Hauts" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const { page: pageParam, type } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`id, name, slug, price, compare_price, is_featured, product_images(url, is_primary, sort_order), product_variants(color, color_hex, image_url)`, { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (type && ["vetement", "accessoire", "chaussure"].includes(type)) {
    query = query.eq("type_produit", type);
  }

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const meta = type ? (TYPE_META[type] ?? null) : null;
  const pageTitle = meta?.title ?? "Tous les produits";
  const pageSubtitle = meta?.subtitle ?? null;
  const baseHref = type ? `/products?type=${type}` : "/products";
  const aspect = (type === "accessoire" || type === "chaussure") ? "aspect-square" : "aspect-[3/4]";

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-12">
        {pageSubtitle && (
          <p className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: "#C98A9B" }}>{pageSubtitle}</p>
        )}
        <h1 className="text-4xl font-semibold tracking-tight mb-2" style={{ color: "#4A2E38" }}>{pageTitle}</h1>
        <p style={{ color: "#9B6B76" }}>
          {count ?? 0} article{(count ?? 0) > 1 ? "s" : ""} disponible{(count ?? 0) > 1 ? "s" : ""}
        </p>
      </div>

      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                compare_price={p.compare_price}
                is_featured={p.is_featured}
                images={p.product_images as { url: string; is_primary: boolean; sort_order?: number }[]}
                variants={p.product_variants as { color: string; color_hex: string; image_url?: string | null }[]}
                aspect={aspect}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              {page > 1 && (
                <Link href={`${baseHref}&page=${page - 1}`} className="px-4 py-2 text-sm border rounded-lg transition-colors" style={{ borderColor: "#C98A9B", color: "#4A2E38" }}>
                  ← Précédent
                </Link>
              )}
              <span className="text-sm px-2" style={{ color: "#9B6B76" }}>Page {page} / {totalPages}</span>
              {page < totalPages && (
                <Link href={`${baseHref}&page=${page + 1}`} className="px-4 py-2 text-sm border rounded-lg transition-colors" style={{ borderColor: "#C98A9B", color: "#4A2E38" }}>
                  Suivant →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-center py-24" style={{ color: "#9B6B76" }}>Aucun produit disponible pour le moment.</p>
      )}
    </div>
  );
}
