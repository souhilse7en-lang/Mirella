-- ============================================================
-- MIGRATION : table messages_contact
-- Exécuter dans Supabase > SQL Editor
-- ============================================================

create table if not exists messages_contact (
  id         uuid primary key default uuid_generate_v4(),
  nom        text not null,
  email      text not null,
  telephone  text,
  message    text not null,
  statut     text not null default 'non_lu'
               check (statut in ('non_lu', 'lu', 'répondu')),
  created_at timestamptz not null default now()
);

alter table messages_contact enable row level security;

drop policy if exists "Envoi message de contact"  on messages_contact;
drop policy if exists "Admin : lecture messages"   on messages_contact;

-- Tout visiteur peut soumettre un message
create policy "Envoi message de contact"
  on messages_contact for insert
  with check (true);

-- Seul l'admin peut lire / mettre à jour les messages
create policy "Admin : lecture messages"
  on messages_contact for all
  using (is_admin());
