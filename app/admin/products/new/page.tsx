import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "../product-form";

const TYPE_TITLES: Record<string, string> = {
  vetement:   "Nouveau vêtement",
  accessoire: "Nouvel accessoire",
  chaussure:  "Nouvelle chaussure",
};

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const defaultType = ["vetement", "accessoire", "chaussure"].includes(type ?? "")
    ? (type as string)
    : "vetement";

  const supabase = await createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/products?type=${defaultType}`}><ArrowLeft size={16} /></Link>
        </Button>
        <h1 className="text-2xl font-semibold">
          {TYPE_TITLES[defaultType]}
        </h1>
      </div>
      <ProductForm collections={collections ?? []} defaultType={defaultType} />
    </div>
  );
}
