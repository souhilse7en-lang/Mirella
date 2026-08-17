"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  compare_price?: number | null;
  is_featured?: boolean;
  disponibilite?: string;
  images: { url: string; is_primary: boolean; sort_order?: number }[];
  variants?: { color: string; color_hex: string; image_url?: string | null }[];
  aspect?: string;
}

export default function ProductCard({
  slug,
  name,
  price,
  compare_price,
  is_featured = false,
  disponibilite = "stock",
  images,
  variants = [],
  aspect = "aspect-[3/4]",
}: ProductCardProps) {
  const sorted = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const primaryImage = sorted.find((i) => i.is_primary) ?? sorted[0];

  // Couleurs dédupliquées avec leur image_url
  const colorMap = new Map<string, { color: string; color_hex: string; image_url?: string | null }>();
  for (const v of variants) {
    if (v.color && !colorMap.has(v.color)) colorMap.set(v.color, v);
  }
  const uniqueColors = [...colorMap.values()];

  const [activeImgUrl, setActiveImgUrl] = useState<string>(primaryImage?.url ?? "");

  const hasDiscount = compare_price && Number(compare_price) > Number(price);
  const hasColorImages = uniqueColors.some((c) => c.image_url);

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl mb-3 ${aspect}`}
        style={{ backgroundColor: "#FAF7F5" }}
      >
        {activeImgUrl ? (
          <>
            <Image
              key={activeImgUrl}
              src={activeImgUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ backgroundColor: "rgba(201,138,155,0.07)" }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs" style={{ color: "#9B6B76" }}>Photo à venir</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {is_featured && (
            <span
              className="text-white text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide"
              style={{ backgroundColor: "#C98A9B" }}
            >
              Nouveauté
            </span>
          )}
          {hasDiscount && !is_featured && (
            <span
              className="text-white text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide"
              style={{ backgroundColor: "#4A2E38" }}
            >
              SOLDES
            </span>
          )}
          {disponibilite === "sur_commande" && (
            <span
              className="text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide"
              style={{ backgroundColor: "#C9A961", color: "#fff" }}
            >
              Sur commande
            </span>
          )}
        </div>
      </div>

      {/* Miniatures couleurs */}
      {uniqueColors.length > 1 && (
        <div className="flex gap-1.5 mb-2" onClick={(e) => e.preventDefault()}>
          {uniqueColors.map((c) => (
            <button
              key={c.color}
              type="button"
              title={c.color}
              onClick={(e) => {
                e.preventDefault();
                if (c.image_url) setActiveImgUrl(c.image_url);
              }}
              className="flex-shrink-0 rounded overflow-hidden transition-all"
              style={{
                width: hasColorImages ? "32px" : "16px",
                height: hasColorImages ? "40px" : "16px",
                borderRadius: hasColorImages ? "4px" : "50%",
                outline: activeImgUrl === c.image_url ? "2px solid #4A2E38" : "2px solid transparent",
                outlineOffset: "2px",
                backgroundColor: c.color_hex || "#ccc",
              }}
            >
              {c.image_url && (
                <img src={c.image_url} alt={c.color} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      <p className="font-medium text-sm truncate" style={{ color: "#4A2E38" }}>
        {name}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-semibold" style={{ color: hasDiscount ? "#C98A9B" : "#4A2E38" }}>
          {Number(price).toLocaleString("fr-FR")} DA
        </span>
        {hasDiscount && (
          <span className="text-xs line-through" style={{ color: "#9B6B76" }}>
            {Number(compare_price).toLocaleString("fr-FR")} DA
          </span>
        )}
      </div>
    </Link>
  );
}
