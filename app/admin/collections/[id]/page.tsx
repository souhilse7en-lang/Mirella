import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CollectionForm from "../collection-form";

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Modifier la collection</h1>
      <CollectionForm initial={data} />
    </div>
  );
}
