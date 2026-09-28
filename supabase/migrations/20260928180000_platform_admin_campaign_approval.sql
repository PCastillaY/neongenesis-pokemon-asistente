-- NeoGénesis: platform administration and campaign approval workflow.

alter table public.profiles
  add column if not exists platform_role text not null default 'USER';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_platform_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_platform_role_check
      check (platform_role in ('USER','PLATFORM_ADMIN'));
  end if;
end $$;

alter table public.campaigns
  add column if not exists status text not null default 'ACTIVE';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.campaigns'::regclass
      and conname = 'campaigns_status_check'
  ) then
    alter table public.campaigns
      add constraint campaigns_status_check
      check (status in ('PENDING','ACTIVE','PAUSED','ARCHIVED','REJECTED'));
  end if;
end $$;

create table if not exists public.campaign_creation_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  progression_mode text not null default 'STANDARD'
    check (progression_mode in ('STANDARD','ACCELERATED','SLOW')),
  image_url text,
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','REJECTED','CANCELLED')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaign_creation_requests_status_idx
  on public.campaign_creation_requests(status, created_at desc);
create index if not exists campaign_creation_requests_user_idx
  on public.campaign_creation_requests(requested_by, created_at desc);
create unique index if not exists campaign_creation_requests_one_pending_per_user_idx
  on public.campaign_creation_requests(requested_by)
  where status = 'PENDING';

alter table public.campaign_creation_requests enable row level security;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and platform_role = 'PLATFORM_ADMIN'
  );
$$;

revoke all on function private.is_platform_admin() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_platform_admin() to authenticated;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
for select to authenticated
using (id = (select auth.uid()) or (select private.is_platform_admin()));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()) or (select private.is_platform_admin()))
with check (id = (select auth.uid()) or (select private.is_platform_admin()));

drop policy if exists campaigns_select_member on public.campaigns;
create policy campaigns_select_member on public.campaigns
for select to authenticated
using (
  ((status = 'ACTIVE') and (select private.is_campaign_member(id)))
  or (select private.is_platform_admin())
);

drop policy if exists campaigns_insert_owner on public.campaigns;
create policy campaigns_insert_admin on public.campaigns
for insert to authenticated
with check ((select private.is_platform_admin()));

drop policy if exists campaigns_update_gm on public.campaigns;
create policy campaigns_update_gm on public.campaigns
for update to authenticated
using ((select private.is_campaign_gm(id)) or (select private.is_platform_admin()))
with check ((select private.is_campaign_gm(id)) or (select private.is_platform_admin()));

drop policy if exists campaigns_delete_admin on public.campaigns;
create policy campaigns_delete_admin on public.campaigns
for delete to authenticated
using ((select private.is_platform_admin()));

create policy campaign_creation_requests_select_own_or_admin
on public.campaign_creation_requests
for select to authenticated
using (requested_by = (select auth.uid()) or (select private.is_platform_admin()));

create policy campaign_creation_requests_insert_self
on public.campaign_creation_requests
for insert to authenticated
with check (requested_by = (select auth.uid()) and status = 'PENDING');

create policy campaign_creation_requests_update_admin
on public.campaign_creation_requests
for update to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy campaign_creation_requests_delete_admin
on public.campaign_creation_requests
for delete to authenticated
using ((select private.is_platform_admin()));

create or replace function public.handle_new_campaign()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.campaign_members (campaign_id, user_id, role, display_name)
  values (new.id, new.created_by, 'GM', null)
  on conflict (campaign_id, user_id) do nothing;

  if new.invite_code is not null then
    insert into public.campaign_invitations (campaign_id, code, created_by)
    values (new.id, upper(new.invite_code), new.created_by)
    on conflict (code) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_campaign_created on public.campaigns;
create trigger on_campaign_created
after insert on public.campaigns
for each row execute function public.handle_new_campaign();

revoke all on function public.handle_new_campaign() from public, anon, authenticated;

create or replace function public.submit_campaign_creation_request(
  request_name text,
  request_description text default '',
  request_progression_mode text default 'STANDARD',
  request_image_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if trim(coalesce(request_name, '')) = '' then
    raise exception 'CAMPAIGN_NAME_REQUIRED' using errcode = '22023';
  end if;

  if request_progression_mode not in ('STANDARD','ACCELERATED','SLOW') then
    raise exception 'INVALID_PROGRESSION_MODE' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.campaign_creation_requests
    where requested_by = v_user_id and status = 'PENDING'
  ) then
    raise exception 'PENDING_REQUEST_EXISTS' using errcode = '23505';
  end if;

  insert into public.campaign_creation_requests (
    requested_by, name, description, progression_mode, image_url
  )
  values (
    v_user_id, trim(request_name), coalesce(request_description, ''),
    request_progression_mode, request_image_url
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

create or replace function public.approve_campaign_creation_request(
  request_id_input uuid,
  review_notes_input text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := auth.uid();
  v_request public.campaign_creation_requests%rowtype;
  v_campaign_id uuid;
  v_invite_code text;
begin
  if not exists (
    select 1 from public.profiles
    where id = v_admin and platform_role = 'PLATFORM_ADMIN'
  ) then
    raise exception 'PLATFORM_ADMIN_REQUIRED' using errcode = '42501';
  end if;

  select * into v_request
  from public.campaign_creation_requests
  where id = request_id_input
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND' using errcode = '22023';
  end if;

  if v_request.status <> 'PENDING' then
    raise exception 'REQUEST_NOT_PENDING' using errcode = '22023';
  end if;

  v_invite_code := upper(encode(gen_random_bytes(4), 'hex'));

  insert into public.campaigns (
    name, description, created_by, progression_mode, invite_code, image_url, status
  )
  values (
    v_request.name, v_request.description, v_request.requested_by,
    v_request.progression_mode, v_invite_code, v_request.image_url, 'ACTIVE'
  )
  returning id into v_campaign_id;

  update public.campaign_creation_requests
  set status = 'APPROVED',
      reviewed_by = v_admin,
      reviewed_at = now(),
      review_notes = coalesce(review_notes_input, ''),
      updated_at = now()
  where id = v_request.id;

  return jsonb_build_object(
    'request_id', v_request.id,
    'campaign_id', v_campaign_id,
    'status', 'APPROVED'
  );
end;
$$;

create or replace function public.reject_campaign_creation_request(
  request_id_input uuid,
  review_notes_input text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := auth.uid();
begin
  if not exists (
    select 1 from public.profiles
    where id = v_admin and platform_role = 'PLATFORM_ADMIN'
  ) then
    raise exception 'PLATFORM_ADMIN_REQUIRED' using errcode = '42501';
  end if;

  update public.campaign_creation_requests
  set status = 'REJECTED',
      reviewed_by = v_admin,
      reviewed_at = now(),
      review_notes = coalesce(review_notes_input, ''),
      updated_at = now()
  where id = request_id_input and status = 'PENDING';

  if not found then
    raise exception 'REQUEST_NOT_PENDING' using errcode = '22023';
  end if;

  return jsonb_build_object('request_id', request_id_input, 'status', 'REJECTED');
end;
$$;

revoke all on function public.submit_campaign_creation_request(text,text,text,text) from public, anon;
revoke all on function public.approve_campaign_creation_request(uuid,text) from public, anon;
revoke all on function public.reject_campaign_creation_request(uuid,text) from public, anon;
grant execute on function public.submit_campaign_creation_request(text,text,text,text) to authenticated;
grant execute on function public.approve_campaign_creation_request(uuid,text) to authenticated;
grant execute on function public.reject_campaign_creation_request(uuid,text) to authenticated;

grant select, insert, update, delete on public.campaign_creation_requests to authenticated;
