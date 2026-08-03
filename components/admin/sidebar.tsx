"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, MessageSquare, LogOut, Plus, Store, Truck, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const links = [
  { label: "Dashboard",    href: "/admin",             icon: LayoutDashboard },
  { label: "Page d'accueil", href: "/admin/homepage",  icon: Home },
  { label: "Produits",     href: "/admin/products",    icon: Package },
  { label: "Collections",  href: "/admin/collections", icon: FolderOpen },
  { label: "Commandes",    href: "/admin/orders",      icon: ShoppingCart },
  { label: "Livraison",    href: "/admin/wilayas",     icon: Truck },
  { label: "Messages",     href: "/admin/messages",    icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 min-h-screen border-r border-border bg-background flex flex-col">
      <div className="px-6 py-5 border-b border-border">
        <Link href="/" className="text-lg font-semibold tracking-widest uppercase">
          Mirella
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Administration</p>
      </div>

      {/* Bouton ajout rapide */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          <Plus size={15} />
          Nouveau produit
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {links.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Store size={16} />
          Voir la boutique
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
