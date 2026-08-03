"use client";

import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

interface Variant { id: string; size: string; color: string; color_hex: string; stock: number; image_url?: string | null; }
interface ColorEntry { color: string; color_hex: string; image_url: string | null; }

export default function AddToCart({
  product,
  variants,
  imageUrl = "",
  typeProduit = "vetement",
  colorList = [],
  selectedColor = "",
  onColorChange,
}: {
  product: { id: string; name: string; slug: string; price: number };
  variants: Variant[];
  imageUrl?: string;
  typeProduit?: string;
  colorList?: ColorEntry[];
  selectedColor?: string;
  onColorChange?: (color: string) => void;
}) {
  const { add } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);

  const isAccessoire = typeProduit === "accessoire";

  const sizes = [...new Set(variants.map((v) => v.size))];
  const hasColors = colorList.length > 0;

  const accessoireVariant = isAccessoire
    ? variants.find((v) => v.stock > 0 && (!hasColors || v.color === selectedColor)) ?? variants[0]
    : undefined;

  const selectedVariant = isAccessoire
    ? accessoireVariant
    : variants.find((v) => v.size === selectedSize && (!hasColors || v.color === selectedColor));

  function handleAdd() {
    if (!selectedVariant) return;
    add({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      size: isAccessoire ? "" : selectedVariant.size,
      color: selectedVariant.color,
      price: Number(product.price),
      imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-5">

      {/* Couleur sélectionnée — affichée comme label, les vignettes sont dans la galerie */}
      {hasColors && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "#4A2E38" }}>
            Couleur{selectedColor && (
              <span className="font-normal ml-1" style={{ color: "#9B6B76" }}>— {selectedColor}</span>
            )}
          </p>
          {/* Fallback cercles si pas d'image par couleur (ex: avant migration) */}
          {colorList.every((c) => !c.image_url) && (
            <div className="flex gap-2 flex-wrap">
              {colorList.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  title={c.color}
                  onClick={() => onColorChange?.(c.color)}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c.color_hex || "#ccc",
                    borderColor: selectedColor === c.color ? "#4A2E38" : "transparent",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          )}
          {!selectedColor && (
            <p className="text-xs" style={{ color: "#C98A9B" }}>Sélectionne une couleur dans la galerie ci-contre</p>
          )}
        </div>
      )}

      {/* Tailles — masquées pour les accessoires */}
      {!isAccessoire && sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "#4A2E38" }}>
            {typeProduit === "chaussure" ? "Pointure" : "Taille"}
          </p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const variant = variants.find((v) => v.size === size && (!hasColors || v.color === selectedColor));
              const outOfStock = variant ? variant.stock === 0 : true;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => !outOfStock && setSelectedSize(size)}
                  disabled={outOfStock}
                  className={`min-w-[44px] h-10 px-3 text-sm border rounded-lg transition-all ${
                    outOfStock ? "opacity-30 line-through cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{
                    backgroundColor: selectedSize === size ? "#4A2E38" : "transparent",
                    color: selectedSize === size ? "#FAF7F5" : "#4A2E38",
                    borderColor: selectedSize === size ? "#4A2E38" : "#E8DFE3",
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Button
        onClick={handleAdd}
        disabled={!selectedVariant || selectedVariant.stock === 0 || (!isAccessoire && !selectedSize)}
        className="w-full h-12 text-base rounded-xl"
        style={{ backgroundColor: "#4A2E38", color: "#FAF7F5" }}
      >
        {added ? (
          <><Check size={18} className="mr-2" />Ajouté au panier</>
        ) : (
          <><ShoppingBag size={18} className="mr-2" />Ajouter au panier</>
        )}
      </Button>

      {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
        <p className="text-xs" style={{ color: "#C9A961" }}>Plus que {selectedVariant.stock} en stock !</p>
      )}
    </div>
  );
}
