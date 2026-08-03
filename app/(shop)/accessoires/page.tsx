import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

const PAGE_SIZE = 12;

export default async function AccessoiresPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data: products, count } = await supabase
    .from("products")
    .select(`id, name, slug, price, compare_price, product_images(url, is_primary)`, { count: "exact" })
    .eq("is_active", true)
    .eq("type_produit", "accessoire")
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Bijoux · Parfums · Foulards</p>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Accessoires</h1>
        <p className="text-muted-foreground">
          {count ?? 0} article{(count ?? 0) > 1 ? "s" : ""} disponible{(count ?? 0) > 1 ? "s" : ""}
        </p>
      </div>

      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {products.map((p) => {
              const imgs = p.product_images as { url: string; is_primary: boolean }[];
              const img = imgs?.find((x) => x.is_primary)?.url ?? imgs?.[0]?.url;
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                    {img ? (
                      <Image src={img} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Photo à venir</span>
                      </div>
                    )}
                    {p.compare_price && Number(p.compare_price) > Number(p.price) && (
                      <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] px-2 py-1 rounded-full font-medium tracking-wide">
                        SOLDES
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold">{Number(p.price).toLocaleString("fr-FR")} DA</span>
                    {p.compare_price && Number(p.compare_price) > Number(p.price) && (
                      <span className="text-xs text-muted-foreground line-through">{Number(p.compare_price).toLocaleString("fr-FR")} DA</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              {page > 1 && (
                <Link href={`/accessoires?page=${page - 1}`} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                  ← Précédent
                </Link>
              )}
              <span className="text-sm text-muted-foreground px-2">Page {page} / {totalPages}</span>
              {page < totalPages && (
                <Link href={`/accessoires?page=${page + 1}`} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                  Suivant →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-center py-24">Aucun accessoire disponible pour le moment.</p>
      )}
    </div>
  );
}
