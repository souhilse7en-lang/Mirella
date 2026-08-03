"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  size: string;
  color: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContext {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (variantId: string) => void;
  update: (variantId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mirella-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("mirella-cart", JSON.stringify(items));
  }, [items]);

  function add(item: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) return prev.map((i) => i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function remove(variantId: string) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  function update(variantId: string, quantity: number) {
    if (quantity <= 0) { remove(variantId); return; }
    setItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity } : i));
  }

  function clear() { setItems([]); }

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, update, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
