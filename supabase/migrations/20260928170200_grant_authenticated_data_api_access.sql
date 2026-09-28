-- NeoGénesis: expose only authenticated table operations to the Data API.
-- RLS remains the authorization boundary for every table.

grant select, insert, update, delete on
  public.profiles,
  public.campaigns,
  public.campaign_members,
  public.characters,
  public.pokemon,
  public.inventory_items,
  public.campaign_sessions,
  public.pokemon_species,
  public.captured_pokemon,
  public.items,
  public.character_inventory,
  public.inventory_events,
  public.campaign_events,
  public.session_notes,
  public.campaign_invitations
to authenticated;

grant execute on function public.join_campaign_by_invite(text) to authenticated;
revoke all on function public.join_campaign_by_invite(text) from anon, public;
