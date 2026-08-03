-- ============================================================
-- MIRELLA — Schéma base de données (boutique vêtements — Algérie)
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- MIGRATION : suppression des tables à restructurer
-- (les tables produits/collections sont conservées avec leurs données)
-- ============================================================

drop table if exists order_items cascade;
drop table if exists orders     cascade;
drop table if exists addresses  cascade;

-- ============================================================
-- FONCTION UTILITAIRE : is_admin()
-- security definer = évite la récursion RLS (la fonction lit
-- profiles sans passer par les policies de profiles)
-- ============================================================

create or replace function is_admin()
returns boolean language plpgsql security definer
set search_path = public as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- ============================================================
-- TABLES
-- ============================================================

-- PROFILS utilisateurs
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- WILAYAS D'ALGÉRIE (58 wilayas officielles)
create table if not exists wilayas (
  id                          integer primary key,
  nom                         text not null,
  frais_livraison_domicile    numeric(10,0) not null,
  frais_livraison_stopdesk    numeric(10,0) not null,
  delai_estime_jours          integer not null
);

-- COLLECTIONS
create table if not exists collections (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- PRODUITS (prix en dinars algériens, sans décimales)
create table if not exists products (
  id              uuid primary key default uuid_generate_v4(),
  collection_id   uuid references collections(id) on delete set null,
  name            text not null,
  slug            text not null unique,
  description     text,
  price           numeric(10,0) not null check (price >= 0),
  compare_price   numeric(10,0) check (compare_price >= 0),
  is_active       boolean not null default true,
  is_featured     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- VARIANTES produit (taille / couleur / stock)
create table if not exists product_variants (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  size        text not null,
  color       text,
  color_hex   text,
  stock       integer not null default 0 check (stock >= 0),
  sku         text unique,
  created_at  timestamptz not null default now()
);

-- IMAGES produit
create table if not exists product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  integer not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- SÉQUENCE pour les numéros de commande (MIR-AAAA-NNNN)
create sequence if not exists commandes_seq start 1;

-- COMMANDES (champs adaptés à l'Algérie)
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  numero_commande   text unique not null
                      default ('MIR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('commandes_seq')::text, 4, '0')),
  user_id           uuid references profiles(id) on delete set null,
  status            text not null default 'en_attente'
                      check (status in ('en_attente', 'confirmée', 'en_préparation', 'expédiée', 'livrée', 'refusée')),
  -- Informations client
  client_nom        text not null,
  client_telephone  text not null,
  client_wilaya_id  integer not null references wilayas(id),
  client_adresse    text not null,
  type_livraison    text not null default 'domicile'
                      check (type_livraison in ('domicile', 'stopdesk')),
  -- Montants en dinars algériens (sans décimales)
  frais_livraison   numeric(10,0) not null default 0,
  montant_produits  numeric(10,0) not null check (montant_produits >= 0),
  montant_total     numeric(10,0) not null check (montant_total >= 0),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- LIGNES DE COMMANDE
create table if not exists order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  variant_id    uuid references product_variants(id) on delete set null,
  product_name  text not null,
  size          text not null,
  color         text,
  unit_price    numeric(10,0) not null,
  quantity      integer not null check (quantity > 0),
  created_at    timestamptz not null default now()
);

-- ============================================================
-- DONNÉES : 58 WILAYAS D'ALGÉRIE avec frais réalistes (DA)
-- Domicile = livraison à domicile | Stopdesk = retrait en agence
-- ============================================================

insert into wilayas (id, nom, frais_livraison_domicile, frais_livraison_stopdesk, delai_estime_jours) values
-- ALGER ET PÉRIPHÉRIE IMMÉDIATE (1-2 jours)
(16, 'Alger',       350,  200, 1),
(9,  'Blida',       400,  250, 1),
(35, 'Boumerdès',   400,  250, 1),
(42, 'Tipaza',      400,  250, 2),

-- NORD — CENTRE (2-3 jours)
(2,  'Chlef',               550,  400, 2),
(6,  'Béjaïa',              600,  450, 2),
(10, 'Bouira',              500,  380, 2),
(15, 'Tizi Ouzou',          500,  350, 2),
(18, 'Jijel',               650,  500, 2),
(26, 'Médéa',               500,  380, 2),
(34, 'Bordj Bou Arréridj',  650,  500, 2),
(38, 'Tissemsilt',          600,  450, 2),
(44, 'Aïn Defla',           550,  400, 2),
(48, 'Relizane',            600,  450, 2),

-- NORD-EST (3 jours)
(4,  'Oum El Bouaghi',  700,  550, 3),
(5,  'Batna',           750,  600, 3),
(12, 'Tébessa',         850,  700, 3),
(19, 'Sétif',           700,  550, 3),
(21, 'Skikda',          750,  600, 3),
(23, 'Annaba',          800,  650, 3),
(24, 'Guelma',          750,  600, 3),
(25, 'Constantine',     700,  550, 3),
(36, 'El Tarf',         800,  650, 3),
(40, 'Khenchela',       800,  650, 3),
(41, 'Souk Ahras',      800,  650, 3),
(43, 'Mila',            700,  550, 3),

-- NORD-OUEST (3 jours)
(13, 'Tlemcen',         750,  600, 3),
(14, 'Tiaret',          650,  500, 3),
(20, 'Saïda',           700,  550, 3),
(22, 'Sidi Bel Abbès',  700,  550, 3),
(27, 'Mostaganem',      700,  550, 3),
(29, 'Mascara',         700,  550, 3),
(31, 'Oran',            700,  550, 3),
(46, 'Aïn Témouchent',  700,  550, 3),

-- HAUTS PLATEAUX — CENTRE (3-4 jours)
(17, 'Djelfa',  750,  600, 3),
(28, 'M''Sila', 700,  550, 3),

-- HAUTS PLATEAUX — OUEST (4 jours)
(32, 'El Bayadh',  950,  750, 4),
(45, 'Naâma',      950,  750, 4),

-- PRÉ-SAHARA — NORD SAHARIEN (4-5 jours)
(3,  'Laghouat',   900,   700, 4),
(7,  'Biskra',     900,   700, 4),
(30, 'Ouargla',    1000,  800, 4),
(39, 'El Oued',    950,   750, 4),
(47, 'Ghardaïa',   950,   750, 4),
(51, 'Ouled Djellal', 1000, 800, 4),
(55, 'Touggourt',  1050,  850, 4),
(57, 'M''Ghair',   1000,  800, 4),
(58, 'El Meniaa',  1050,  850, 5),

-- GRAND SUD SAHARIEN (5-6 jours)
(8,  'Béchar',   1200, 950,  5),
(49, 'Timimoun', 1400, 1100, 6),
(52, 'Béni Abbès', 1300, 1050, 6),

-- EXTRÊME SUD (6-8 jours)
(1,  'Adrar',               1500, 1200, 6),
(11, 'Tamanrasset',         1600, 1300, 7),
(33, 'Illizi',              1700, 1400, 8),
(37, 'Tindouf',             1600, 1300, 7),
(50, 'Bordj Badji Mokhtar', 1800, 1500, 8),
(53, 'In Salah',            1600, 1300, 7),
(54, 'In Guezzam',          1800, 1500, 8),
(56, 'Djanet',              1700, 1400, 8)

on conflict (id) do update set
  nom                        = excluded.nom,
  frais_livraison_domicile   = excluded.frais_livraison_domicile,
  frais_livraison_stopdesk   = excluded.frais_livraison_stopdesk,
  delai_estime_jours         = excluded.delai_estime_jours;

-- ============================================================
-- TRIGGER : profil auto à l'inscription (auth.users → profiles)
-- security definer + set search_path = public : contourne RLS
-- pour que le trigger puisse insérer même si l'utilisateur
-- n'est pas encore authentifié au sens RLS
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_products_collection   on products(collection_id);
create index if not exists idx_products_active        on products(is_active, is_featured);
create index if not exists idx_variants_product       on product_variants(product_id);
create index if not exists idx_images_product         on product_images(product_id, sort_order);
create index if not exists idx_orders_user            on orders(user_id, status);
create index if not exists idx_orders_wilaya          on orders(client_wilaya_id);
create index if not exists idx_orders_numero          on orders(numero_commande);
create index if not exists idx_order_items_order      on order_items(order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles         enable row level security;
alter table wilayas          enable row level security;
alter table collections      enable row level security;
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table product_images   enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;

-- ----------------------------------------------------------------
-- PROFILS
-- ----------------------------------------------------------------
drop policy if exists "Lecture profil personnel"         on profiles;
drop policy if exists "Mise à jour profil personnel"     on profiles;
drop policy if exists "Inscription : création de profil" on profiles;
drop policy if exists "Admin : accès total profils"      on profiles;

create policy "Lecture profil personnel"
  on profiles for select using (auth.uid() = id);

create policy "Mise à jour profil personnel"
  on profiles for update using (auth.uid() = id);

-- Permet à un utilisateur de créer son propre profil
-- (fallback si le trigger échoue) ; le trigger lui-même
-- utilise security definer et contourne RLS directement.
create policy "Inscription : création de profil"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Admin : accès total profils"
  on profiles for all using (is_admin());

-- ----------------------------------------------------------------
-- WILAYAS (lecture publique, modification admin uniquement)
-- ----------------------------------------------------------------
drop policy if exists "Lecture publique wilayas" on wilayas;
drop policy if exists "Admin : gestion wilayas"  on wilayas;

create policy "Lecture publique wilayas"
  on wilayas for select using (true);

create policy "Admin : gestion wilayas"
  on wilayas for all using (is_admin());

-- ----------------------------------------------------------------
-- COLLECTIONS
-- ----------------------------------------------------------------
drop policy if exists "Lecture publique collections actives" on collections;
drop policy if exists "Admin : gestion collections"         on collections;

create policy "Lecture publique collections actives"
  on collections for select using (is_active = true);

create policy "Admin : gestion collections"
  on collections for all using (is_admin());

-- ----------------------------------------------------------------
-- PRODUITS
-- ----------------------------------------------------------------
drop policy if exists "Lecture publique produits actifs" on products;
drop policy if exists "Admin : gestion produits"        on products;

create policy "Lecture publique produits actifs"
  on products for select using (is_active = true);

create policy "Admin : gestion produits"
  on products for all using (is_admin());

-- ----------------------------------------------------------------
-- VARIANTES
-- ----------------------------------------------------------------
drop policy if exists "Lecture publique variantes" on product_variants;
drop policy if exists "Admin : gestion variantes"  on product_variants;

create policy "Lecture publique variantes"
  on product_variants for select using (true);

create policy "Admin : gestion variantes"
  on product_variants for all using (is_admin());

-- ----------------------------------------------------------------
-- IMAGES
-- ----------------------------------------------------------------
drop policy if exists "Lecture publique images" on product_images;
drop policy if exists "Admin : gestion images"  on product_images;

create policy "Lecture publique images"
  on product_images for select using (true);

create policy "Admin : gestion images"
  on product_images for all using (is_admin());

-- ----------------------------------------------------------------
-- COMMANDES
-- ----------------------------------------------------------------
drop policy if exists "Lecture commandes personnelles" on orders;
drop policy if exists "Création commande"              on orders;
drop policy if exists "Admin : gestion commandes"      on orders;

create policy "Lecture commandes personnelles"
  on orders for select using (auth.uid() = user_id);

create policy "Création commande"
  on orders for insert with check (auth.uid() = user_id or user_id is null);

create policy "Admin : gestion commandes"
  on orders for all using (is_admin());

-- ----------------------------------------------------------------
-- LIGNES DE COMMANDE
-- ----------------------------------------------------------------
drop policy if exists "Lecture lignes de commande personnelles" on order_items;
drop policy if exists "Insertion lignes de commande"           on order_items;
drop policy if exists "Admin : gestion lignes commande"        on order_items;

create policy "Lecture lignes de commande personnelles"
  on order_items for select
  using (exists (select 1 from orders where id = order_id and user_id = auth.uid()));

create policy "Insertion lignes de commande"
  on order_items for insert
  with check (exists (select 1 from orders where id = order_id and (user_id = auth.uid() or user_id is null)));

create policy "Admin : gestion lignes commande"
  on order_items for all using (is_admin());

-- ============================================================
-- STORAGE — bucket "products" (images produits)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict do nothing;

drop policy if exists "Lecture publique images produits"    on storage.objects;
drop policy if exists "Admin : upload images produits"      on storage.objects;
drop policy if exists "Admin : suppression images produits" on storage.objects;

create policy "Lecture publique images produits"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Admin : upload images produits"
  on storage.objects for insert
  with check (bucket_id = 'products' and is_admin());

create policy "Admin : suppression images produits"
  on storage.objects for delete
  using (bucket_id = 'products' and is_admin());
