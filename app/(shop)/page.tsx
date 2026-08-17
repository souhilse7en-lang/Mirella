import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/shop/product-card";

const HERO_DEFAULTS = {
  hero_eyebrow:  "Nouvelle collection · Rentrée 2026",
  hero_title_1:  "L'élégance",
  hero_title_2:  "au quotidien",
  hero_subtitle: "La mode qui vous révèle.",
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: collections }, { data: featured }, { data: siteContent }] = await Promise.all([
    supabase
      .from("collections")
      .select("id, name, slug, image_url")
      .eq("is_active", true)
      .order("sort_order")
      .limit(3),
    supabase
      .from("products")
      .select(`id, name, slug, price, compare_price, is_featured, disponibilite, delai_sur_commande, product_images(url, is_primary, sort_order), product_variants(color, color_hex, image_url)`)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("site_content").select("key, value"),
  ]);

  const hero = { ...HERO_DEFAULTS };
  if (siteContent) siteContent.forEach((row) => { hero[row.key as keyof typeof hero] = row.value; });

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-end" style={{ backgroundColor: "#FAF7F5" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #F5EDE8 0%, #FAF7F5 50%, #F0E8ED 100%)" }} />

        {/* Lettre décorative */}
        <span className="absolute top-10 right-8 text-[160px] font-bold select-none leading-none hidden lg:block" style={{ color: "rgba(201,138,155,0.08)" }}>
          M
        </span>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-24 pt-32">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] mb-6" style={{ color: "#C98A9B" }}>
              {hero.hero_eyebrow}
            </p>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.9] mb-8" style={{ color: "#4A2E38" }}>
              {hero.hero_title_1}<br />
              <span className="italic font-light" style={{ color: "#9B6B76" }}>{hero.hero_title_2}</span>
            </h1>
            <p className="text-lg max-w-md mb-10 leading-relaxed" style={{ color: "#9B6B76" }}>
              {hero.hero_subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8" style={{ backgroundColor: "#4A2E38", color: "#FAF7F5" }}>
                <Link href="/collections">Découvrir la collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8" style={{ borderColor: "#C98A9B", color: "#C98A9B" }}>
                <Link href="/products">Nouveautés</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ──────────────────────────────────── */}
      {collections && collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: "#C98A9B" }}>Explorer</p>
              <h2 className="text-3xl font-semibold tracking-tight" style={{ color: "#4A2E38" }}>Nos collections</h2>
            </div>
            <Link href="/collections" className="hidden sm:flex items-center gap-2 text-sm transition-colors group" style={{ color: "#9B6B76" }}>
              Tout voir <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className={`grid gap-4 ${collections.length === 1 ? "grid-cols-1" : collections.length === 2 ? "grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.slug}`} className="group relative overflow-hidden rounded-2xl block">
                <div className="relative aspect-[3/4]" style={{ backgroundColor: "#F0E8ED" }}>
                  {c.image_url ? (
                    <Image src={c.image_url} alt={c.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold" style={{ color: "rgba(201,138,155,0.4)" }}>{c.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white text-xl font-semibold mb-1">{c.name}</p>
                    <p className="text-white/70 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Voir la collection <ArrowRight size={12} />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUITS VEDETTES ────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="py-24" style={{ backgroundColor: "#F5EDE8" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: "#C98A9B" }}>Sélection</p>
                <h2 className="text-3xl font-semibold tracking-tight" style={{ color: "#4A2E38" }}>Coups de cœur</h2>
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-2 text-sm transition-colors group" style={{ color: "#9B6B76" }}>
                Voir tout <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((p, i) => (
                <div key={p.id} className={i % 2 === 1 ? "mt-8" : ""}>
                  <ProductCard
                    slug={p.slug}
                    name={p.name}
                    price={p.price}
                    compare_price={p.compare_price}
                    is_featured={p.is_featured}
                    disponibilite={(p as { disponibilite?: string }).disponibilite ?? "stock"}
                    delaiSurCommande={(p as { delai_sur_commande?: string | null }).delai_sur_commande ?? null}
                    images={p.product_images as { url: string; is_primary: boolean; sort_order?: number }[]}
                    variants={p.product_variants as { color: string; color_hex: string; image_url?: string | null }[]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BANNER VALEURS ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { title: "Livraison nationale", sub: "Dans les 58 wilayas" },
            { title: "Retours gratuits", sub: "Sous 30 jours" },
            { title: "Paiement à la livraison", sub: "Aucune CB requise" },
            { title: "Service client", sub: "Du dimanche au jeudi" },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: "rgba(201,138,155,0.12)" }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C98A9B" }} />
              </div>
              <p className="font-medium text-sm" style={{ color: "#4A2E38" }}>{item.title}</p>
              <p className="text-xs" style={{ color: "#9B6B76" }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÉTAT VIDE ────────────────────────────────────── */}
      {(!collections || collections.length === 0) && (!featured || featured.length === 0) && (
        <section className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">La boutique arrive bientôt.</p>
            <p className="text-xs text-muted-foreground mt-2">Ajoute des produits depuis le back-office admin.</p>
          </div>
        </section>
      )}
    </div>
  );
}
