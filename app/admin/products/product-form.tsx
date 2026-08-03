"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import ImageUploader from "@/components/admin/image-uploader";
import SingleImageUploader from "@/components/admin/single-image-uploader";

interface Variant { id?: string; size: string; color: string; color_hex: string; stock: number; sku: string; image_url?: string | null; }
interface Image   { id?: string; url: string; alt: string; is_primary: boolean; sort_order: number; }
interface ColorEntry { name: string; hex: string; image: string; }

interface Product {
  id?: string;
  name: string; slug: string; description: string;
  price: number; compare_price: number | null;
  collection_id: string; is_active: boolean; is_featured: boolean;
  type_produit?: string;
}

const TYPE_OPTIONS = [
  { value: "vetement",   label: "Vêtement (S / M / L / XL…)" },
  { value: "accessoire", label: "Accessoire (parfum, chaîne, foulard…)" },
  { value: "chaussure",  label: "Chaussure (pointures 36-41)" },
];

const SIZE_OPTIONS: Record<string, string[]> = {
  vetement:   ["S", "M", "L", "XL", "XXL"],
  accessoire: ["Taille unique"],
  chaussure:  ["36", "37", "38", "39", "40", "41"],
};

function generateSku(slug: string, size: string, color: string): string {
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const s = norm(size === "Taille unique" ? "uni" : size);
  const c = color ? `-${norm(color).slice(0, 8)}` : "";
  return `${slug.slice(0, 18)}-${s}${c}`;
}

function buildColorsFromVariants(variants: Variant[]): ColorEntry[] {
  if (variants.length === 0) return [{ name: "", hex: "#000000", image: "" }];
  const seen = new Map<string, { hex: string; image: string }>();
  for (const v of variants) {
    if (!seen.has(v.color)) seen.set(v.color, { hex: v.color_hex || "#000000", image: v.image_url || "" });
  }
  const result = [...seen.entries()].map(([name, { hex, image }]) => ({ name, hex, image }));
  return result.length > 0 ? result : [{ name: "", hex: "#000000", image: "" }];
}

function buildStocksFromVariants(variants: Variant[], colors: ColorEntry[]): Record<string, number> {
  const colorIdx = new Map(colors.map((c, i) => [c.name, i]));
  const result: Record<string, number> = {};
  for (const v of variants) {
    const ci = colorIdx.get(v.color) ?? 0;
    result[`${v.size}__${ci}`] = v.stock;
  }
  return result;
}

export default function ProductForm({
  initial,
  variants: initVariants = [],
  images: initImages = [],
  collections,
  defaultType = "vetement",
}: {
  initial?: Product;
  variants?: Variant[];
  images?: Image[];
  collections: { id: string; name: string }[];
  defaultType?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Product>(
    initial ?? {
      name: "", slug: "", description: "",
      price: 0, compare_price: null,
      collection_id: "", is_active: true, is_featured: false,
      type_produit: defaultType,
    }
  );

  const initColors = buildColorsFromVariants(initVariants);
  const [colors, setColors] = useState<ColorEntry[]>(initColors);
  const [stocks, setStocks] = useState<Record<string, number>>(
    buildStocksFromVariants(initVariants, initColors)
  );
  const [images, setImages] = useState<Image[]>(
    initImages.length > 0 ? initImages : [{ url: "", alt: "", is_primary: true, sort_order: 0 }]
  );

  function setField(field: keyof Product, value: string | boolean | number | null) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function toSlug(text: string) {
    return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  function handleTypeChange(type: string) {
    setField("type_produit", type);
    setStocks({});
  }

  // ── Couleurs ──────────────────────────────────────────────────────────────
  function addColor() {
    setColors((c) => [...c, { name: "", hex: "#000000", image: "" }]);
  }
  function updateColor(i: number, field: keyof ColorEntry, value: string) {
    setColors((c) => c.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }
  function removeColor(i: number) {
    setColors((c) => c.filter((_, idx) => idx !== i));
    setStocks((s) => {
      const next: Record<string, number> = {};
      for (const [key, val] of Object.entries(s)) {
        const [size, ciStr] = key.split("__");
        const ci = Number(ciStr);
        if (ci < i) next[key] = val;
        else if (ci > i) next[`${size}__${ci - 1}`] = val;
      }
      return next;
    });
  }

  function setStock(size: string, ci: number, value: number) {
    setStocks((s) => ({ ...s, [`${size}__${ci}`]: value }));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation : chaque couleur nommée doit avoir une photo
    const namedColors = colors.filter((c) => c.name.trim() !== "");
    if (namedColors.length > 0) {
      const missing = namedColors.find((c) => !c.image);
      if (missing) {
        setError(`Photo manquante pour la couleur "${missing.name}". Chaque couleur doit avoir sa propre photo.`);
        return;
      }
    }

    setLoading(true);

    let productId = initial?.id;

    const { type_produit, ...formWithoutType } = form;
    const payload       = { ...form,           compare_price: form.compare_price || null };
    const payloadNoType = { ...formWithoutType, compare_price: form.compare_price || null };

    async function saveProduct(data: typeof payload) {
      if (productId) {
        const { error } = await supabase.from("products").update(data).eq("id", productId!);
        return { error };
      } else {
        const { data: row, error } = await supabase.from("products").insert(data).select("id").single();
        return { error, id: row?.id };
      }
    }

    if (productId) {
      let { error } = await saveProduct(payload);
      if (error?.message?.includes("type_produit")) ({ error } = await saveProduct(payloadNoType));
      if (error) { setError(error.message); setLoading(false); return; }
      await supabase.from("product_variants").delete().eq("product_id", productId);
      await supabase.from("product_images").delete().eq("product_id", productId);
    } else {
      let { error, id } = await saveProduct(payload);
      if (error?.message?.includes("type_produit")) ({ error, id } = await saveProduct(payloadNoType));
      if (error || !id) { setError(error?.message ?? "Erreur"); setLoading(false); return; }
      productId = id;
    }

    const sizeList = SIZE_OPTIONS[form.type_produit ?? "vetement"] ?? SIZE_OPTIONS.vetement;

    const variantRows = namedColors.length > 0
      ? namedColors.flatMap((color, ci) =>
          sizeList.map((size) => ({
            product_id: productId,
            size,
            color:      color.name,
            color_hex:  color.hex,
            image_url:  color.image || null,
            stock:      stocks[`${size}__${ci}`] ?? 0,
            sku:        generateSku(form.slug, size, color.name),
          }))
        )
      : sizeList.map((size) => ({
          product_id: productId,
          size,
          color:      "",
          color_hex:  "",
          image_url:  null as string | null,
          stock:      stocks[`${size}__0`] ?? 0,
          sku:        generateSku(form.slug, size, ""),
        }));

    if (variantRows.length > 0) {
      const { error: varErr } = await supabase.from("product_variants").insert(variantRows);
      // Si image_url n'existe pas encore en base, réessayer sans ce champ
      if (varErr?.message?.includes("image_url")) {
        await supabase.from("product_variants").insert(
          variantRows.map(({ image_url: _, ...rest }) => rest)
        );
      }
    }

    const validImages = images.filter((img) => img.url);
    if (validImages.length > 0) {
      await supabase.from("product_images").insert(
        validImages.map((img, i) => ({ ...img, product_id: productId, sort_order: i }))
      );
    }

    router.push(`/admin/products?type=${form.type_produit ?? "vetement"}`);
    router.refresh();
  }

  const sizeOptions = SIZE_OPTIONS[form.type_produit ?? "vetement"] ?? SIZE_OPTIONS.vetement;
  const isAccessoire = form.type_produit === "accessoire";
  const namedColors = colors.filter((c) => c.name.trim() !== "");

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-10">

      {/* ── Infos générales ────────────────────────────────────────── */}
      <section className="bg-background border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-medium mb-2">Informations générales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Nom *</label>
            <input
              value={form.name}
              onChange={(e) => { setField("name", e.target.value); setField("slug", toSlug(e.target.value)); }}
              required
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              required
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Type de produit</label>
            <select
              value={form.type_produit}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Prix (DA) *</label>
            <input
              type="number" step="1" min="0" required
              value={form.price}
              onChange={(e) => setField("price", Number(e.target.value))}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Prix barré (DA)</label>
            <input
              type="number" step="1" min="0"
              value={form.compare_price ?? ""}
              onChange={(e) => setField("compare_price", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Collection</label>
            <select
              value={form.collection_id}
              onChange={(e) => setField("collection_id", e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Aucune —</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setField("is_active", e.target.checked)} className="rounded" />
              Actif (visible sur le site)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setField("is_featured", e.target.checked)} className="rounded" />
              Produit vedette (page d'accueil)
            </label>
          </div>
        </div>
      </section>

      {/* ── Images générales ────────────────────────────────────────── */}
      <section className="bg-background border border-border rounded-xl p-6">
        <h2 className="font-medium mb-1">Photos générales du produit</h2>
        <p className="text-xs text-muted-foreground mb-4">Ces photos s'affichent par défaut (sans couleur sélectionnée).</p>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      {/* ── Couleurs & Stock ────────────────────────────────────────── */}
      <section className="bg-background border border-border rounded-xl p-6 space-y-6">
        <div>
          <h2 className="font-medium">Couleurs & Stock</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pour chaque couleur, ajoute une photo dédiée — elle s'affichera quand le client sélectionne cette couleur.
          </p>
        </div>

        {/* Liste des couleurs avec photo */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Couleurs disponibles</p>

          {colors.map((c, ci) => (
            <div key={ci} className="flex items-start gap-4 border border-border rounded-xl p-4 bg-muted/20">
              {/* Photo de la couleur */}
              <SingleImageUploader
                value={c.image}
                onChange={(url) => updateColor(ci, "image", url)}
                label="Photo *"
              />

              {/* Sélecteur hex + nom */}
              <div className="flex-1 space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updateColor(ci, "hex", e.target.value)}
                    className="w-9 h-9 rounded-md cursor-pointer border border-border bg-transparent p-0.5"
                    title="Teinte de la couleur"
                  />
                  <input
                    placeholder="Nom de la couleur (ex: Noir)"
                    value={c.name}
                    onChange={(e) => updateColor(ci, "name", e.target.value)}
                    className="flex-1 text-sm border border-input rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(ci)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {c.name.trim() !== "" && !c.image && (
                  <p className="text-xs text-destructive">⚠ Photo requise pour cette couleur</p>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addColor}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors w-full justify-center"
          >
            <Plus size={13} />
            Ajouter une couleur
          </button>
        </div>

        {/* Grille stock : tailles × couleurs */}
        {namedColors.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">
              {isAccessoire ? "Stock par couleur" : `Stock par ${form.type_produit === "chaussure" ? "pointure" : "taille"} et couleur`}
            </p>
            <div className="overflow-x-auto">
              <table className="text-sm border-collapse">
                <thead>
                  <tr>
                    {!isAccessoire && (
                      <th className="text-left pr-6 pb-2 text-muted-foreground font-medium">
                        {form.type_produit === "chaussure" ? "Pointure" : "Taille"}
                      </th>
                    )}
                    {namedColors.map((c, ci) => (
                      <th key={ci} className="pb-2 px-3 font-medium min-w-[80px]">
                        <div className="flex items-center gap-1.5 justify-center">
                          {c.image ? (
                            <img src={c.image} alt={c.name} className="w-5 h-6 object-cover rounded" />
                          ) : (
                            <span className="w-3 h-3 rounded-full inline-block border border-border/50" style={{ backgroundColor: c.hex }} />
                          )}
                          {c.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeOptions.map((size) => (
                    <tr key={size} className="border-t border-border/50">
                      {!isAccessoire && (
                        <td className="pr-6 py-2 font-medium text-sm">{size}</td>
                      )}
                      {namedColors.map((_, ci) => (
                        <td key={ci} className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            value={stocks[`${size}__${ci}`] ?? 0}
                            onChange={(e) => setStock(size, ci, Number(e.target.value))}
                            className="w-20 border border-input rounded-md px-2 py-1.5 text-sm text-center bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {namedColors.length === 0 && (
          <div>
            <p className="text-sm font-medium mb-3">
              {isAccessoire ? "Stock" : `Stock par ${form.type_produit === "chaussure" ? "pointure" : "taille"}`}
            </p>
            <div className="flex flex-wrap gap-3">
              {sizeOptions.map((size) => (
                <div key={size} className="flex items-center gap-2">
                  {!isAccessoire && <span className="text-sm font-medium w-10">{size}</span>}
                  <input
                    type="number"
                    min="0"
                    value={stocks[`${size}__0`] ?? 0}
                    onChange={(e) => setStock(size, 0, Number(e.target.value))}
                    className="w-20 border border-input rounded-md px-2 py-1.5 text-sm text-center bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement…" : initial?.id ? "Mettre à jour" : "Créer le produit"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/products?type=${form.type_produit ?? "vetement"}`)}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
