-- NeoGénesis: harden platform role and campaign status changes.

drop policy if exists profiles_insert_self on public.profiles;

create policy profiles_insert_self on public.profiles
for insert to authenticated
with check (id = (select auth.uid()) and platform_role = 'USER');

create or replace function private.protect_platform_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.platform_role is distinct from new.platform_role
     and not exists (
       select 1 from public.profiles
       where id = (select auth.uid())
         and platform_role = 'PLATFORM_ADMIN'
     ) then
    raise exception 'PLATFORM_ROLE_CHANGE_FORBIDDEN' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.protect_platform_role_change() from public, anon, authenticated;

drop trigger if exists protect_platform_role on public.profiles;
create trigger protect_platform_role
before update on public.profiles
for each row execute function private.protect_platform_role_change();

create or replace function private.protect_campaign_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status
     and not exists (
       select 1 from public.profiles
       where id = (select auth.uid())
         and platform_role = 'PLATFORM_ADMIN'
     ) then
    raise exception 'CAMPAIGN_STATUS_CHANGE_FORBIDDEN' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.protect_campaign_status_change() from public, anon, authenticated;

drop trigger if exists protect_campaign_status on public.campaigns;
create trigger protect_campaign_status
before update on public.campaigns
for each row execute function private.protect_campaign_status_change();

create index if not exists campaign_creation_requests_reviewed_by_idx
  on public.campaign_creation_requests(reviewed_by);