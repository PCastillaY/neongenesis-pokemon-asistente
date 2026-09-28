create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_members (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('PLAYER', 'GM')),
  display_name text,
  joined_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null,
  user_id uuid not null,
  name text not null,
  concept text not null default '',
  level integer not null default 1 check (level > 0),
  hp integer not null default 0 check (hp >= 0),
  max_hp integer not null default 0 check (max_hp >= 0),
  action_points integer not null default 0 check (action_points >= 0),
  max_action_points integer not null default 0 check (max_action_points >= 0),
  money integer not null default 0,
  classes jsonb not null default '[]'::jsonb,
  attributes jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (campaign_id, user_id) references public.campaign_members(campaign_id, user_id) on delete cascade,
  unique (campaign_id, user_id)
);

create table public.pokemon (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  name text not null,
  species text not null,
  level integer not null default 1 check (level > 0),
  hp integer not null default 0 check (hp >= 0),
  max_hp integer not null default 0 check (max_hp >= 0),
  types jsonb not null default '[]'::jsonb,
  ability text not null default '',
  moves jsonb not null default '[]'::jsonb,
  nature text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  name text not null,
  quantity integer not null default 1 check (quantity >= 0),
  category text not null default 'OTHER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_sessions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  session_number integer not null check (session_number > 0),
  title text not null default '',
  played_at timestamptz,
  summary text not null default '',
  notes text not null default '',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, session_number)
);

create index campaign_members_user_idx on public.campaign_members(user_id);
create index characters_campaign_idx on public.characters(campaign_id);
create index pokemon_character_idx on public.pokemon(character_id);
create index inventory_character_idx on public.inventory_items(character_id);
create index campaign_sessions_campaign_idx on public.campaign_sessions(campaign_id);

create or replace function public.is_campaign_member(target_campaign_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.campaign_members where campaign_id = target_campaign_id and user_id = auth.uid());
$$;

create or replace function public.is_campaign_gm(target_campaign_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.campaign_members where campaign_id = target_campaign_id and user_id = auth.uid() and role = 'GM');
$$;

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.characters enable row level security;
alter table public.pokemon enable row level security;
alter table public.inventory_items enable row level security;
alter table public.campaign_sessions enable row level security;

create policy "profiles_select_self" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "campaigns_select_member" on public.campaigns for select to authenticated using (public.is_campaign_member(id));
create policy "campaigns_insert_owner" on public.campaigns for insert to authenticated with check (created_by = auth.uid());
create policy "campaigns_update_gm" on public.campaigns for update to authenticated using (public.is_campaign_gm(id)) with check (public.is_campaign_gm(id));

create policy "campaign_members_select_member" on public.campaign_members for select to authenticated using (public.is_campaign_member(campaign_id));
create policy "campaign_members_insert_gm" on public.campaign_members for insert to authenticated with check (public.is_campaign_gm(campaign_id));
create policy "campaign_members_update_gm" on public.campaign_members for update to authenticated using (public.is_campaign_gm(campaign_id)) with check (public.is_campaign_gm(campaign_id));
create policy "campaign_members_delete_gm" on public.campaign_members for delete to authenticated using (public.is_campaign_gm(campaign_id));

create policy "characters_select_member" on public.characters for select to authenticated using (public.is_campaign_member(campaign_id));
create policy "characters_insert_self_or_gm" on public.characters for insert to authenticated with check (public.is_campaign_gm(campaign_id) or (user_id = auth.uid() and public.is_campaign_member(campaign_id)));
create policy "characters_update_self_or_gm" on public.characters for update to authenticated using (public.is_campaign_gm(campaign_id) or user_id = auth.uid()) with check (public.is_campaign_gm(campaign_id) or user_id = auth.uid());
create policy "characters_delete_gm" on public.characters for delete to authenticated using (public.is_campaign_gm(campaign_id));

create policy "pokemon_select_member" on public.pokemon for select to authenticated using (
  exists (select 1 from public.characters c where c.id = character_id and public.is_campaign_member(c.campaign_id))
);
create policy "pokemon_write_owner_or_gm" on public.pokemon for all to authenticated using (
  exists (select 1 from public.characters c where c.id = character_id and (c.user_id = auth.uid() or public.is_campaign_gm(c.campaign_id)))
) with check (
  exists (select 1 from public.characters c where c.id = character_id and (c.user_id = auth.uid() or public.is_campaign_gm(c.campaign_id)))
);

create policy "inventory_select_member" on public.inventory_items for select to authenticated using (
  exists (select 1 from public.characters c where c.id = character_id and public.is_campaign_member(c.campaign_id))
);
create policy "inventory_write_owner_or_gm" on public.inventory_items for all to authenticated using (
  exists (select 1 from public.characters c where c.id = character_id and (c.user_id = auth.uid() or public.is_campaign_gm(c.campaign_id)))
) with check (
  exists (select 1 from public.characters c where c.id = character_id and (c.user_id = auth.uid() or public.is_campaign_gm(c.campaign_id)))
);

create policy "sessions_select_member" on public.campaign_sessions for select to authenticated using (public.is_campaign_member(campaign_id));
create policy "sessions_write_gm" on public.campaign_sessions for all to authenticated using (public.is_campaign_gm(campaign_id)) with check (public.is_campaign_gm(campaign_id));

grant execute on function public.is_campaign_member(uuid) to authenticated;
grant execute on function public.is_campaign_gm(uuid) to authenticated;
