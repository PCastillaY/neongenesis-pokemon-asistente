-- NeoGénesis: secure campaign joining by invitation code.
-- The same code is used by the shareable link (?invite=CODE).

create or replace function public.join_campaign_by_invite(invite_code_input text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := upper(trim(invite_code_input));
  v_campaign_id uuid;
  v_campaign_name text;
  v_invitation_id uuid;
  v_max_uses integer;
  v_uses integer;
  v_expires_at timestamptz;
  v_existing_role text;
  v_display_name text;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if v_code is null or length(v_code) < 4 then
    raise exception 'INVALID_INVITE_CODE' using errcode = '22023';
  end if;

  select cm.role
    into v_existing_role
  from public.campaign_members cm
  join public.campaign_invitations ci on ci.campaign_id = cm.campaign_id
  where cm.user_id = v_user_id
    and upper(ci.code) = v_code
  limit 1;

  if v_existing_role is not null then
    select c.id, c.name
      into v_campaign_id, v_campaign_name
    from public.campaign_members cm
    join public.campaign_invitations ci on ci.campaign_id = cm.campaign_id
    join public.campaigns c on c.id = cm.campaign_id
    where cm.user_id = v_user_id
      and upper(ci.code) = v_code
    limit 1;

    return jsonb_build_object(
      'campaign_id', v_campaign_id,
      'campaign_name', v_campaign_name,
      'role', v_existing_role,
      'already_member', true
    );
  end if;

  select ci.id, ci.campaign_id, c.name, ci.max_uses, ci.uses, ci.expires_at
    into v_invitation_id, v_campaign_id, v_campaign_name, v_max_uses, v_uses, v_expires_at
  from public.campaign_invitations ci
  join public.campaigns c on c.id = ci.campaign_id
  where upper(ci.code) = v_code
  for update of ci;

  if v_invitation_id is null then
    raise exception 'INVITE_NOT_FOUND' using errcode = '22023';
  end if;

  if v_expires_at is not null and v_expires_at <= now() then
    raise exception 'INVITE_EXPIRED' using errcode = '22023';
  end if;

  if v_max_uses is not null and v_uses >= v_max_uses then
    raise exception 'INVITE_LIMIT_REACHED' using errcode = '22023';
  end if;

  select p.display_name into v_display_name
  from public.profiles p
  where p.id = v_user_id;

  insert into public.campaign_members (campaign_id, user_id, role, display_name)
  values (v_campaign_id, v_user_id, 'PLAYER', coalesce(v_display_name, ''));

  update public.campaign_invitations
  set uses = uses + 1
  where id = v_invitation_id;

  return jsonb_build_object(
    'campaign_id', v_campaign_id,
    'campaign_name', v_campaign_name,
    'role', 'PLAYER',
    'already_member', false
  );
exception
  when unique_violation then
    select cm.role, cm.campaign_id, c.name
      into v_existing_role, v_campaign_id, v_campaign_name
    from public.campaign_members cm
    join public.campaign_invitations ci on ci.campaign_id = cm.campaign_id
    join public.campaigns c on c.id = cm.campaign_id
    where cm.user_id = v_user_id
      and upper(ci.code) = v_code
    limit 1;

    if v_existing_role is not null then
      return jsonb_build_object(
        'campaign_id', v_campaign_id,
        'campaign_name', v_campaign_name,
        'role', v_existing_role,
        'already_member', true
      );
    end if;
    raise;
end;
$$;

revoke all on function public.join_campaign_by_invite(text) from public, anon;
grant execute on function public.join_campaign_by_invite(text) to authenticated;
