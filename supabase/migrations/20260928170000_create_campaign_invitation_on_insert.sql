-- NeoGénesis: create the persistent invitation alongside a campaign.

create or replace function public.handle_new_campaign()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.campaign_members (campaign_id, user_id, role, display_name)
  values (new.id, new.created_by, 'GM', null);

  if new.invite_code is not null then
    insert into public.campaign_invitations (campaign_id, code, created_by)
    values (new.id, upper(new.invite_code), new.created_by);
  end if;

  return new;
end;
$$;
