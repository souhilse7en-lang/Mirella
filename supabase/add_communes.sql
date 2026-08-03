-- Migration : communes algériennes + FK sur orders
-- Exécuter dans le SQL Editor Supabase

-- 1. Table communes
CREATE TABLE IF NOT EXISTS communes (
  id        serial  PRIMARY KEY,
  wilaya_id integer NOT NULL REFERENCES wilayas(id) ON DELETE CASCADE,
  nom       text    NOT NULL,
  code_postal text
);

CREATE INDEX IF NOT EXISTS idx_communes_wilaya ON communes(wilaya_id);

-- 2. Champ commune sur les commandes (informatif, nullable)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS client_commune_id integer REFERENCES communes(id);
