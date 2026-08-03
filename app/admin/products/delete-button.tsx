"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    await supabase.from("products").delete().eq("id", id);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
      <Trash2 size={14} />
    </Button>
  );
}
