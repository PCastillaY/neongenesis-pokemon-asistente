-- Deterministic PTU NG support: presets and combat state.
-- This migration mirrors the live schema introduced while the rules engine was being iterated.

create table if not exists public.pokemon_presets (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.pokemon_species(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  name text not null,
  description text not null default '',
  stat_weights jsonb not null default '{}'::jsonb,
  nature_weights jsonb not null default '{}'::jsonb,
  move_weights jsonb not null default '{}'::jsonb,
  behavior_rules jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pokemon_presets_scope_check check (campaign_id is not null or created_by is not null)
);

create index if not exists pokemon_presets_species_idx on public.pokemon_presets(species_id, active);
create index if not exists pokemon_presets_campaign_idx on public.pokemon_presets(campaign_id, active);

create table if not exists public.combat_encounters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  session_id uuid references public.campaign_sessions(id) on delete set null,
  name text not null,
  status text not null default 'PREPARING' check (status in ('PREPARING','ACTIVE','PAUSED','FINISHED')),
  current_round integer not null default 1 check (current_round > 0),
  current_turn integer not null default 0 check (current_turn >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists combat_encounters_campaign_idx on public.combat_encounters(campaign_id, created_at desc);

create table if not exists public.combat_participants (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.combat_encounters(id) on delete cascade,
  participant_type text not null check (participant_type in ('TRAINER','CAPTURED_POKEMON','WILD_POKEMON')),
  source_id uuid,
  species_id uuid references public.pokemon_species(id) on delete set null,
  name text not null,
  level integer not null check (level between 1 and 100),
  side text not null check (side in ('ALLY','ENEMY','NEUTRAL')),
  initiative integer,
  hp integer not null default 0,
  max_hp integer not null default 0,
  stats jsonb not null default '{}'::jsonb,
  moves jsonb not null default '[]'::jsonb,
  nature text,
  preset_id uuid references public.pokemon_presets(id) on delete set null,
  state jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists combat_participants_encounter_idx on public.combat_participants(encounter_id, sort_order);

create table if not exists public.combat_actions (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.combat_encounters(id) on delete cascade,
  actor_participant_id uuid not null references public.combat_participants(id) on delete restrict,
  target_participant_id uuid references public.combat_participants(id) on delete restrict,
  round integer not null,
  turn integer not null,
  action_type text not null,
  move_name text,
  declared_data jsonb not null default '{}'::jsonb,
  calculated_data jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists combat_actions_encounter_idx on public.combat_actions(encounter_id, round, turn, created_at);

create table if not exists public.combat_rolls (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references public.combat_actions(id) on delete cascade,
  dice_expression text not null,
  physical_result integer not null,
  modifier integer not null default 0,
  total integer not null,
  purpose text not null,
  created_at timestamptz not null default now()
);

create index if not exists combat_rolls_action_idx on public.combat_rolls(action_id);

alter table public.pokemon_presets enable row level security;
alter table public.combat_encounters enable row level security;
alter table public.combat_participants enable row level security;
alter table public.combat_actions enable row level security;
alter table public.combat_rolls enable row level security;

grant select, insert, update, delete on public.pokemon_presets to authenticated;
grant select, insert, update, delete on public.combat_encounters to authenticated;
grant select, insert, update, delete on public.combat_participants to authenticated;
grant select, insert, update, delete on public.combat_actions to authenticated;
grant select, insert, update, delete on public.combat_rolls to authenticated;

-- Policies are defined in the live database during the iterative rollout.
-- Keep them in the canonical migration once the complete rules/RLS contract is finalized.
