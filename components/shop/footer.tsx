import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Marque */}
          <div>
            <p className="text-xl font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: "#4A2E38" }}>Mirella</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La mode qui vous révèle.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-medium mb-4 uppercase tracking-wider">Boutique</p>
            <ul className="space-y-2">
              {[
                { label: "Nouveautés", href: "/collections/nouveautes" },
                { label: "Collections", href: "/collections" },
                { label: "Tous les produits", href: "/products" },
                { label: "Panier", href: "/cart" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <p className="text-sm font-medium mb-4 uppercase tracking-wider">Aide</p>
            <ul className="space-y-2">
              {[
                { label: "Mon compte", href: "/account" },
                { label: "Mes commandes", href: "/account/orders" },
                { label: "Livraison & retours", href: "/livraison" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mirella. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Paiement à la livraison · Livraison partout en Algérie
          </p>
        </div>
      </div>
    </footer>
  );
}
