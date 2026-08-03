"use client";

import Link from "next/link";
import { ShoppingBag, User, Menu, X, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";

const links = [
  { label: "Nouveautés",  href: "/collections/nouveautes" },
  { label: "Collections", href: "/collections" },
  { label: "Produits",    href: "/products" },
  { label: "Accessoires", href: "/products?type=accessoire" },
  { label: "Chaussures",  href: "/products?type=chaussure" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("role")
      .single()
      .then(({ data }) => {
        if (data?.role === "admin") setIsAdmin(true);
      });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="text-2xl font-semibold tracking-[0.3em] uppercase" style={{ color: "#4A2E38" }}>
            Mirella
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                title="Administration"
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/80 transition-colors"
              >
                <Settings size={13} />
                Admin
              </Link>
            )}
            <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
              <User size={20} />
            </Link>
            <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors relative">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
            <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-4 py-4 gap-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                Administration →
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
