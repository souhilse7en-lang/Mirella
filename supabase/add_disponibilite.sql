-- Ajoute le statut de disponibilité aux produits
ALTER TABLE products
ADD COLUMN IF NOT EXISTS disponibilite text NOT NULL DEFAULT 'stock'
CHECK (disponibilite IN ('stock', 'sur_commande'));

ALTER TABLE products
ADD COLUMN IF NOT EXISTS delai_sur_commande text;
