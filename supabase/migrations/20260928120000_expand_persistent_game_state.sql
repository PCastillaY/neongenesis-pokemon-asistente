-- NeoGénesis: persistent game-state expansion
-- Applied to Supabase project kodypakhrxwdbxffxtxt as migration expand_persistent_game_state.

alter table public.campaigns
  add column if not exists progression_mode text not null default 'STANDARD'
    check (progression_mode in ('STANDARD','ACCELERATED','SLOW')),
  add column if not exists invite_code text unique,
  add column if not exists image_url text;

alter table public.characters
  add column if not exists avatar_url text,
  add column if not exists experience integer not null default 0,
  add column if not exists background text not null default '',
  add column if not exists notes text not null default '',
  add column if not exists features jsonb not null default '[]'::jsonb,
  add column if not exists talents jsonb not null default '[]'::jsonb,
  add column if not exists abilities jsonb not null default '[]'::jsonb,
  add column if not exists capabilities jsonb not null default '[]'::jsonb;

create table if not exists public.pokemon_species (
  id uuid primary key default gen_random_uuid(),
  dex_number integer,
  name text not null unique,
  types jsonb not null default '[]'::jsonb,
  base_stats jsonb not null default '{}'::jsonb,
  abilities jsonb not null default '[]'::jsonb,
  capabilities jsonb not null default '[]'::jsonb,
  description text not null default '',
  image_url text,
  rules_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pokemon_species_dex_number_idx
  on public.pokemon_species(dex_number) where dex_number is not null;

create table if not exists public.captured_pokemon (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  species_id uuid references public.pokemon_species(id) on delete set null,
  nickname text not null default '',
  level integer not null default 1 check (level > 0),
  hp integer not null default 0 check (hp >= 0),
  max_hp integer not null default 0 check (max_hp >= 0),
  experience integer not null default 0,
  types jsonb not null default '[]'::jsonb,
  ability text not null default '',
  moves jsonb not null default '[]'::jsonb,
  nature text,
  held_item text,
  image_url text,
  status text not null default '',
  notes text not null default '',
  sheet_data jsonb not null default '{}'::jsonb,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists captured_pokemon_character_idx on public.captured_pokemon(character_id);
create index if not exists captured_pokemon_species_idx on public.captured_pokemon(species_id);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'OTHER',
  description text not null default '',
  image_url text,
  rules_data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists items_name_ci_idx on public.items(lower(name));

create table if not exists public.character_inventory (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  custom_name text,
  quantity integer not null default 0 check (quantity >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (item_id is not null or custom_name is not null)
);

create unique index if not exists character_inventory_item_idx
  on public.character_inventory(character_id, item_id) where item_id is not null;
create index if not exists character_inventory_character_idx on public.character_inventory(character_id);

create table if not exists public.inventory_events (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  inventory_id uuid references public.character_inventory(id) on delete set null,
  item_id uuid references public.items(id) on delete set null,
  session_id uuid references public.campaign_sessions(id) on delete set null,
  event_type text not null check (event_type in ('ACQUIRED','USED','LOST','SOLD','PURCHASED','GIVEN','RECEIVED','ADJUSTED')),
  quantity_delta integer not null,
  quantity_after integer,
  reason text not null default '',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists inventory_events_character_created_idx
  on public.inventory_events(character_id, created_at desc);

create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  session_id uuid references public.campaign_sessions(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  title text not null,
  detail text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists campaign_events_campaign_created_idx
  on public.campaign_events(campaign_id, created_at desc);
create index if not exists campaign_events_session_idx on public.campaign_events(session_id);

create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.campaign_sessions(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  title text not null default '',
  content text not null default '',
  note_type text not null default 'GENERAL'
    check (note_type in ('GENERAL','CLUE','NPC','LOCATION','QUEST','COMBAT','LOOT','TODO')),
  is_gm_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists session_notes_session_idx on public.session_notes(session_id);

create table if not exists public.campaign_invitations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz,
  max_uses integer,
  uses integer not null default 0 check (uses >= 0),
  created_at timestamptz not null default now(),
  check (max_uses is null or max_uses > 0)
);

create index if not exists campaign_invitations_campaign_idx on public.campaign_invitations(campaign_id);

alter table public.pokemon_species enable row level security;
alter table public.captured_pokemon enable row level security;
alter table public.items enable row level security;
alter table public.character_inventory enable row level security;
alter table public.inventory_events enable row level security;
alter table public.campaign_events enable row level security;
alter table public.session_notes enable row level security;
alter table public.campaign_invitations enable row level security;

create policy pokemon_species_select_authenticated on public.pokemon_species
  for select to authenticated using (true);

create policy captured_pokemon_select_member on public.captured_pokemon
  for select to authenticated using (
    exists (select 1 from public.characters c
      where c.id = character_id and (select public.is_campaign_member(c.campaign_id)))
  );

create policy captured_pokemon_write_owner_or_gm on public.captured_pokemon
  for all to authenticated using (
    exists (select 1 from public.characters c
      where c.id = character_id
      and (c.user_id = (select auth.uid()) or (select public.is_campaign_gm(c.campaign_id))))
  ) with check (
    exists (select 1 from public.characters c
      where c.id = character_id
      and (c.user_id = (select auth.uid()) or (select public.is_campaign_gm(c.campaign_id))))
  );

create policy items_select_authenticated on public.items
  for select to authenticated using (true);

create policy items_insert_authenticated on public.items
  for insert to authenticated with check ((select auth.uid()) = created_by);

create policy character_inventory_select_member on public.character_inventory
  for select to authenticated using (
    exists (select 1 from public.characters c
      where c.id = character_id and (select public.is_campaign_member(c.campaign_id)))
  );

create policy character_inventory_write_owner_or_gm on public.character_inventory
  for all to authenticated using (
    exists (select 1 from public.characters c
      where c.id = character_id
      and (c.user_id = (select auth.uid()) or (select public.is_campaign_gm(c.campaign_id))))
  ) with check (
    exists (select 1 from public.characters c
      where c.id = character_id
      and (c.user_id = (select auth.uid()) or (select public.is_campaign_gm(c.campaign_id))))
  );

create policy inventory_events_select_member on public.inventory_events
  for select to authenticated using (
    exists (select 1 from public.characters c
      where c.id = character_id and (select public.is_campaign_member(c.campaign_id)))
  );

create policy inventory_events_insert_owner_or_gm on public.inventory_events
  for insert to authenticated with check (
    (select auth.uid()) = created_by
    and exists (select 1 from public.characters c
      where c.id = character_id
      and (c.user_id = (select auth.uid()) or (select public.is_campaign_gm(c.campaign_id))))
  );

create policy campaign_events_select_member on public.campaign_events
  for select to authenticated using ((select public.is_campaign_member(campaign_id)));

create policy campaign_events_insert_member on public.campaign_events
  for insert to authenticated with check (
    (select auth.uid()) = actor_user_id
    and (select public.is_campaign_member(campaign_id))
  );

create policy session_notes_select_member on public.session_notes
  for select to authenticated using (
    exists (select 1 from public.campaign_sessions s
      where s.id = session_id
      and (select public.is_campaign_member(s.campaign_id))
      and (not is_gm_only or (select public.is_campaign_gm(s.campaign_id))))
  );

create policy session_notes_insert_member on public.session_notes
  for insert to authenticated with check (
    (select auth.uid()) = author_user_id
    and exists (select 1 from public.campaign_sessions s
      where s.id = session_id
      and (select public.is_campaign_member(s.campaign_id))
      and (not is_gm_only or (select public.is_campaign_gm(s.campaign_id))))
  );

create policy session_notes_update_author_or_gm on public.session_notes
  for update to authenticated using (
    (select auth.uid()) = author_user_id
    or exists (select 1 from public.campaign_sessions s
      where s.id = session_id and (select public.is_campaign_gm(s.campaign_id)))
  ) with check (
    (select auth.uid()) = author_user_id
    or exists (select 1 from public.campaign_sessions s
      where s.id = session_id and (select public.is_campaign_gm(s.campaign_id)))
  );

create policy session_notes_delete_author_or_gm on public.session_notes
  for delete to authenticated using (
    (select auth.uid()) = author_user_id
    or exists (select 1 from public.campaign_sessions s
      where s.id = session_id and (select public.is_campaign_gm(s.campaign_id)))
  );

create policy campaign_invitations_select_gm on public.campaign_invitations
  for select to authenticated using ((select public.is_campaign_gm(campaign_id)));

create policy campaign_invitations_insert_gm on public.campaign_invitations
  for insert to authenticated with check (
    (select public.is_campaign_gm(campaign_id)) and (select auth.uid()) = created_by
  );

create policy campaign_invitations_delete_gm on public.campaign_invitations
  for delete to authenticated using ((select public.is_campaign_gm(campaign_id)));
