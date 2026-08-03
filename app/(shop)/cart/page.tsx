"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, count, total, update, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: "#C98A9B" }} />
        <h1 className="text-2xl font-semibold mb-2" style={{ color: "#4A2E38" }}>Votre panier est vide</h1>
        <p className="mb-8" style={{ color: "#9B6B76" }}>Découvrez nos collections et trouvez les pièces qui vous correspondent.</p>
        <Button asChild className="rounded-full px-8" style={{ backgroundColor: "#4A2E38", color: "#FAF7F5" }}>
          <Link href="/collections">Voir les collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-10" style={{ color: "#4A2E38" }}>
        Panier <span className="font-normal text-xl" style={{ color: "#9B6B76" }}>({count} article{count > 1 ? "s" : ""})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Articles */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 p-4 rounded-xl" style={{ backgroundColor: "#FAF7F5", border: "1px solid #E8DFE3" }}>
              <div className="w-20 h-24 rounded-lg flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#F0E8ED" }}>
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium truncate" style={{ color: "#4A2E38" }}>{item.name}</p>
                    <p className="text-sm mt-0.5" style={{ color: "#9B6B76" }}>
                      {item.size}{item.color && ` · ${item.color}`}
                    </p>
                  </div>
                  <button onClick={() => remove(item.variantId)} className="transition-colors ml-2" style={{ color: "#9B6B76" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1px solid #E8DFE3" }}>
                    <button onClick={() => update(item.variantId, item.quantity - 1)} className="px-3 py-1.5 transition-colors hover:bg-rose-50">
                      <Minus size={14} style={{ color: "#4A2E38" }} />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-medium" style={{ borderLeft: "1px solid #E8DFE3", borderRight: "1px solid #E8DFE3", color: "#4A2E38" }}>{item.quantity}</span>
                    <button onClick={() => update(item.variantId, item.quantity + 1)} className="px-3 py-1.5 transition-colors hover:bg-rose-50">
                      <Plus size={14} style={{ color: "#4A2E38" }} />
                    </button>
                  </div>
                  <p className="font-semibold" style={{ color: "#4A2E38" }}>{(item.price * item.quantity).toLocaleString("fr-FR")} DA</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé */}
        <div className="lg:col-span-1">
          <div className="rounded-xl p-6 sticky top-20" style={{ backgroundColor: "#FAF7F5", border: "1px solid #E8DFE3" }}>
            <h2 className="font-semibold mb-5" style={{ color: "#4A2E38" }}>Résumé de commande</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#9B6B76" }}>Sous-total</span>
                <span className="font-medium" style={{ color: "#4A2E38" }}>{total.toLocaleString("fr-FR")} DA</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#9B6B76" }}>Frais de livraison</span>
                <span className="text-xs italic" style={{ color: "#9B6B76" }}>Calculés à l'étape suivante</span>
              </div>
            </div>
            <p className="text-xs mt-4 pt-4" style={{ color: "#9B6B76", borderTop: "1px solid #E8DFE3" }}>
              Les frais dépendent de votre wilaya et du mode de livraison choisi.
            </p>
            <Button asChild className="w-full mt-5 h-11 rounded-xl" style={{ backgroundColor: "#4A2E38", color: "#FAF7F5" }}>
              <Link href="/checkout">Passer la commande</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full mt-2" style={{ color: "#9B6B76" }}>
              <Link href="/collections">Continuer mes achats</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
