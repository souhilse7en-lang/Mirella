-- Contenu éditable de la page d'accueil
CREATE TABLE IF NOT EXISTS site_content (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Données par défaut
INSERT INTO site_content (key, value) VALUES
  ('hero_eyebrow',  'Nouvelle collection · Rentrée 2026'),
  ('hero_title_1',  'L''élégance'),
  ('hero_title_2',  'au quotidien'),
  ('hero_subtitle', 'La mode qui vous révèle.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
