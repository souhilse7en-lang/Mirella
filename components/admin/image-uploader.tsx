"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Star, Loader2 } from "lucide-react";

interface ImageEntry {
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order: number;
}

interface Props {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
}

export default function ImageUploader({ images, onChange }: Props) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList) {
    setError("");
    setUploading(true);
    const uploaded: ImageEntry[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;

      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) { setError(uploadError.message); continue; }

      const { data } = supabase.storage.from("products").getPublicUrl(path);
      uploaded.push({
        url: data.publicUrl,
        alt: file.name.replace(/\.[^.]+$/, ""),
        is_primary: images.length === 0 && uploaded.length === 0,
        sort_order: images.length + uploaded.length,
      });
    }

    onChange([...images, ...uploaded]);
    setUploading(false);
  }

  function remove(i: number) {
    const next = images.filter((_, idx) => idx !== i);
    if (images[i].is_primary && next.length > 0) next[0].is_primary = true;
    onChange(next);
  }

  function setPrimary(i: number) {
    onChange(images.map((img, idx) => ({ ...img, is_primary: idx === i })));
  }

  function setAlt(i: number, alt: string) {
    onChange(images.map((img, idx) => idx === i ? { ...img, alt } : img));
  }

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-input rounded-xl p-8 text-center cursor-pointer hover:border-foreground/40 hover:bg-muted/30 transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 size={24} className="animate-spin" />
            <p className="text-sm">Upload en cours…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload size={24} />
            <p className="text-sm font-medium">Glisse tes photos ici</p>
            <p className="text-xs">ou clique pour sélectionner · JPG, PNG, WEBP</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Aperçu des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                <Image src={img.url} alt={img.alt || "photo"} fill className="object-cover" />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    title="Image principale"
                    className={`p-1.5 rounded-full ${img.is_primary ? "bg-yellow-400 text-black" : "bg-white/80 text-black hover:bg-yellow-400"} transition-colors`}
                  >
                    <Star size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="p-1.5 rounded-full bg-white/80 text-black hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>

                {img.is_primary && (
                  <span className="absolute top-1.5 left-1.5 bg-yellow-400 text-black text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    ★ Principale
                  </span>
                )}
              </div>

              <input
                type="text"
                value={img.alt}
                onChange={(e) => setAlt(i, e.target.value)}
                placeholder="Description…"
                className="mt-1.5 w-full text-xs border border-input rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
