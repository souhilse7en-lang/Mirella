"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Truck } from "lucide-react";
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

  const firstColorWithImage = colorList.find((c) => c.image_url);
  // Auto-sélection : couleur avec image > première couleur sans image > aucune
  const [selectedColor, setSelectedColor] = useState<string>(
    firstColorWithImage?.color ?? colorList[0]?.color ?? ""
  );
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-x-12 lg:gap-x-16">

      {/* ── Galerie ──────────────────────────────────────────── */}
      <section className="md:col-span-7 flex flex-col gap-3">

        {/* Image principale */}
        <div
          className="relative w-full aspect-[3/4] overflow-hidden rounded-xl"
          style={{ backgroundColor: "#FAF7F5", boxShadow: "0 4px 20px rgba(201,138,155,0.08)" }}
        >
          {activeImageUrl ? (
            <Image
              key={activeImageUrl}
              src={activeImageUrl}
              alt={activeImageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm" style={{ color: "#9B6B76" }}>Photo à venir</span>
            </div>
          )}
          <button
            aria-label="Ajouter aux favoris"
            className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-white/80"
            style={{ backgroundColor: "rgba(255,255,255,0.55)", backdropFilter: "blur(4px)" }}
          >
            <Heart size={20} style={{ color: "#4A2E38" }} />
          </button>
        </div>

        {/* Miniatures couleurs (vignettes cliquables) */}
        {colorList.length >= 1 && (
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {colorList.map((c) => (
              <button
                key={c.color}
                type="button"
                title={c.color}
                onClick={() => selectColor(c.color)}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer transition-all hover:opacity-80"
                style={{
                  outline: selectedColor === c.color ? "2px solid #4A2E38" : "2px solid transparent",
                  outlineOffset: "2px",
                  backgroundColor: "#F0E8ED",
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

        {/* Autres photos du produit (produits sans variante couleur) */}
        {images.length > 1 && colorList.length === 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectGalleryImage(img.url, img.alt || product.name)}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer transition-all hover:opacity-80"
                style={{
                  outline: activeImageUrl === img.url ? "2px solid #4A2E38" : "2px solid transparent",
                  outlineOffset: "2px",
                  backgroundColor: "#F0E8ED",
                }}
              >
                <Image src={img.url} alt={img.alt || product.name} fill sizes="25vw" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Infos produit ────────────────────────────────────── */}
      <section className="md:col-span-5 flex flex-col pt-6 md:pt-0 md:sticky md:top-28 md:self-start">

        {/* Fil d'Ariane */}
        {collection && (
          <nav className="hidden md:flex items-center gap-1.5 text-sm mb-5" style={{ color: "#9B6B76" }}>
            <Link href="/collections" className="hover:opacity-70 transition-opacity">Collections</Link>
            <span>/</span>
            <Link href={`/collections/${collection.slug}`} className="hover:opacity-70 transition-opacity">
              {collection.name}
            </Link>
          </nav>
        )}

        {/* Titre + Prix */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight mb-3" style={{ color: "#4A2E38" }}>
            {product.name}
          </h1>
          <div className="flex items-center gap-3">
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
        </div>

        {/* Description */}
        {product.description && (
          <p className="leading-relaxed mb-8" style={{ color: "#9B6B76" }}>
            {product.description}
          </p>
        )}

        {/* Couleur + Taille + Bouton */}
        <AddToCart
          product={product}
          variants={variants}
          imageUrl={activeImageUrl}
          typeProduit={typeProduit}
          colorList={colorList}
          selectedColor={selectedColor}
          onColorChange={selectColor}
        />

        {/* Bloc livraison */}
        <div
          className="mt-6 rounded-xl p-4 flex items-start gap-3"
          style={{ backgroundColor: "#FDF9F7", border: "1px solid rgba(201,138,155,0.2)" }}
        >
          <Truck size={20} style={{ color: "#C98A9B", flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm leading-relaxed" style={{ color: "#9B6B76" }}>
            <span className="block font-semibold mb-0.5" style={{ color: "#4A2E38" }}>
              Livraison gratuite à Alger sous 48h.
            </span>
            Paiement sécurisé à la livraison disponible.
          </p>
        </div>
      </section>
    </div>
  );
}
