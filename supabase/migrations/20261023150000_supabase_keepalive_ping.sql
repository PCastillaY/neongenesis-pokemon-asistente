-- Lightweight Postgres activity endpoint for the Supabase Free-tier keepalive.
-- This function reveals no project data and performs no writes.
create or replace function public.keepalive_ping()
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select true;
$$;

revoke all on function public.keepalive_ping() from public;
grant execute on function public.keepalive_ping() to anon, authenticated;
