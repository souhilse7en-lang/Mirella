"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCart from "./add-to-cart";

interface ColorEntry {
  color: string;
  color_hex: string;
  image_url: string | null;
}

interface Variant {
  id: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
  image_url?: string | null;
}

interface ProductImage {
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number | null;
  description?: string | null;
}

export default function ProductClientView({
  product,
  variants,
  images,
  typeProduit,
  collection,
}: {
  product: Product;
  variants: Variant[];
  images: ProductImage[];
  typeProduit: string;
  collection: { name: string; slug: string } | null;
}) {
  // Dédupliquer les couleurs depuis les variantes
  const colorMap = new Map<string, ColorEntry>();
  for (const v of variants) {
    if (v.color && !colorMap.has(v.color)) {
      colorMap.set(v.color, { color: v.color, color_hex: v.color_hex, image_url: v.image_url ?? null });
    }
  }
  const colorList = [...colorMap.values()];

  const primaryImage = images.find((i) => i.is_primary) ?? images[0];

  // Initialiser sur la première couleur ayant une image, sinon l'image principale
  const firstColorWithImage = colorList.find((c) => c.image_url);
  const [selectedColor, setSelectedColor] = useState<string>(firstColorWithImage?.color ?? "");
  const [activeImageUrl, setActiveImageUrl] = useState<string>(
    firstColorWithImage?.image_url ?? primaryImage?.url ?? ""
  );
  const [activeImageAlt, setActiveImageAlt] = useState<string>(
    firstColorWithImage?.color ?? primaryImage?.alt ?? product.name
  );

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);

  function selectColor(color: string) {
    setSelectedColor(color);
    const entry = colorMap.get(color);
    if (entry?.image_url) {
      setActiveImageUrl(entry.image_url);
      setActiveImageAlt(color);
    }
  }

  function selectGalleryImage(url: string, alt: string) {
    setActiveImageUrl(url);
    setActiveImageAlt(alt);
    setSelectedColor("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

      {/* ── Galerie ──────────────────────────────────────────── */}
      <div className="space-y-3">

        {/* Image principale */}
        <div
          className="relative aspect-[3/4] rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#FAF7F5" }}
        >
          {activeImageUrl ? (
            <Image
              key={activeImageUrl}
              src={activeImageUrl}
              alt={activeImageAlt}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm" style={{ color: "#9B6B76" }}>Photo à venir</span>
            </div>
          )}
        </div>

        {/* Miniatures couleurs (vignettes cliquables) */}
        {colorList.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {colorList.map((c) => (
              <button
                key={c.color}
                type="button"
                title={c.color}
                onClick={() => selectColor(c.color)}
                className="w-[60px] h-[72px] rounded-lg overflow-hidden flex-shrink-0 transition-all"
                style={{
                  outline: selectedColor === c.color ? "2px solid #4A2E38" : "2px solid transparent",
                  outlineOffset: "2px",
                }}
              >
                {c.image_url ? (
                  <img src={c.image_url} alt={c.color} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: c.color_hex || "#ccc" }} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Autres photos du produit (si pas de couleurs multiples) */}
        {images.length > 1 && colorList.length <= 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectGalleryImage(img.url, img.alt || product.name)}
                className="relative aspect-square rounded-lg overflow-hidden transition-all"
                style={{
                  outline: activeImageUrl === img.url ? "2px solid #4A2E38" : "2px solid transparent",
                  outlineOffset: "2px",
                  backgroundColor: "#F0E8ED",
                }}
              >
                <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Infos produit ────────────────────────────────────── */}
      <div className="flex flex-col">

        {collection && (
          <Link
            href={`/collections/${collection.slug}`}
            className="text-xs uppercase tracking-widest mb-3 hover:opacity-70 transition-opacity"
            style={{ color: "#C98A9B" }}
          >
            {collection.name}
          </Link>
        )}

        <h1 className="text-3xl font-semibold tracking-tight mb-4" style={{ color: "#4A2E38" }}>
          {product.name}
        </h1>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-semibold" style={{ color: hasDiscount ? "#C98A9B" : "#4A2E38" }}>
            {Number(product.price).toLocaleString("fr-FR")} DA
          </span>
          {hasDiscount && product.compare_price && (
            <>
              <span className="text-lg line-through" style={{ color: "#9B6B76" }}>
                {Number(product.compare_price).toLocaleString("fr-FR")} DA
              </span>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ backgroundColor: "#4A2E38", color: "#FAF7F5" }}
              >
                Soldes
              </span>
            </>
          )}
        </div>

        {product.description && (
          <p className="leading-relaxed mb-8" style={{ color: "#9B6B76" }}>
            {product.description}
          </p>
        )}

        <AddToCart
          product={product}
          variants={variants}
          imageUrl={activeImageUrl}
          typeProduit={typeProduit}
          colorList={colorList}
          selectedColor={selectedColor}
          onColorChange={selectColor}
        />
      </div>
    </div>
  );
}
