import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: variants }, { data: images }, { data: collections }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("product_variants").select("*").eq("product_id", id),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
    supabase.from("collections").select("id, name").eq("is_active", true).order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products"><ArrowLeft size={16} /></Link>
          </Button>
          <h1 className="text-2xl font-semibold">Modifier le produit</h1>
        </div>
        <Button asChild>
          <Link href="/admin/products/new"><Plus size={16} className="mr-2" />Nouveau produit</Link>
        </Button>
      </div>
      <ProductForm initial={product} variants={variants ?? []} images={images ?? []} collections={collections ?? []} />
    </div>
  );
}
