-- Ajout du champ type_produit à la table products
-- Valeurs : 'vetement' (défaut), 'accessoire', 'chaussure'
-- À exécuter dans Supabase > SQL Editor

ALTER TABLE products
ADD COLUMN IF NOT EXISTS type_produit text NOT NULL DEFAULT 'vetement'
CHECK (type_produit IN ('vetement', 'accessoire', 'chaussure'));
