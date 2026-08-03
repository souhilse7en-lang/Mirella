"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface Collection {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function CollectionForm({ initial }: { initial?: Collection }) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Collection>(
    initial ?? { name: "", slug: "", description: "", image_url: "", is_active: true, sort_order: 0 }
  );

  function set(field: keyof Collection, value: string | boolean | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toSlug(text: string) {
    return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `collections/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    set("image_url", data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = { ...form };

    if (initial?.id) {
      const { error } = await supabase.from("collections").update(payload).eq("id", initial.id);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.from("collections").insert(payload);
      if (error) { setError(error.message); setLoading(false); return; }
    }

    router.push("/admin/collections");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium block mb-1.5">Nom *</label>
          <input
            value={form.name}
            onChange={(e) => { set("name", e.target.value); set("slug", toSlug(e.target.value)); }}
            required
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium block mb-1.5">Slug *</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            required
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium block mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Image upload */}
        <div className="col-span-2">
          <label className="text-sm font-medium block mb-1.5">Image de la collection</label>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
          {form.image_url ? (
            <div className="relative inline-block">
              <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-border">
                <Image src={form.image_url} alt="Aperçu" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => set("image_url", "")}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
              >
                <X size={12} />
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 block text-xs text-muted-foreground underline hover:text-foreground"
              >
                Changer l'image
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-input rounded-xl p-6 text-center cursor-pointer hover:border-foreground/40 hover:bg-muted/30 transition-all"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 size={20} className="animate-spin" />
                  <p className="text-sm">Upload en cours…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload size={20} />
                  <p className="text-sm font-medium">Cliquer pour uploader une image</p>
                  <p className="text-xs">JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Ordre d'affichage</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium">Active (visible sur le site)</label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Enregistrement…" : initial?.id ? "Mettre à jour" : "Créer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/collections")}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
