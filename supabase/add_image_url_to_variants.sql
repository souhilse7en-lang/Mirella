-- Ajoute le champ image_url sur product_variants
-- Une image par couleur : la même URL est stockée sur toutes les lignes de la même couleur
-- (ex: Noir S, Noir M, Noir L partagent le même image_url)
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS image_url text;
