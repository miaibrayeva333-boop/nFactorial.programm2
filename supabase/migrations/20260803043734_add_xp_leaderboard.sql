create table public.xp_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  total_xp integer not null default 0 check (total_xp >= 0),
  updated_at timestamptz not null default now()
);

create table public.xp_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity text not null check (activity in ('daily_tasks', 'health_checkin')),
  award_date date not null default (now() at time zone 'utc')::date,
  points integer not null check (points in (30, 50)),
  created_at timestamptz not null default now(),
  unique (user_id, activity, award_date)
);

alter table public.xp_profiles enable row level security;
alter table public.xp_awards enable row level security;

create policy "read own xp profile"
  on public.xp_profiles for select using (auth.uid() = user_id);

create policy "read own xp awards"
  on public.xp_awards for select using (auth.uid() = user_id);

create or replace function public.sync_xp_profile(p_display_name text default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  safe_name text;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;

  select left(coalesce(
    nullif(trim(p_display_name), ''),
    nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(raw_user_meta_data ->> 'name'), ''),
    split_part(email, '@', 1),
    'Smart Axis learner'
  ), 40) into safe_name
  from auth.users where id = current_user_id;

  insert into public.xp_profiles (user_id, display_name)
  values (current_user_id, safe_name)
  on conflict (user_id) do update
    set display_name = excluded.display_name, updated_at = now();
end;
$$;

create or replace function public.award_xp(p_activity text)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  reward integer;
  inserted_points integer;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  reward := case p_activity when 'daily_tasks' then 50 when 'health_checkin' then 30 else null end;
  if reward is null then raise exception 'Unknown XP activity'; end if;

  perform public.sync_xp_profile(null);
  insert into public.xp_awards (user_id, activity, points)
  values (current_user_id, p_activity, reward)
  on conflict (user_id, activity, award_date) do nothing
  returning points into inserted_points;

  if inserted_points is null then return 0; end if;
  update public.xp_profiles
    set total_xp = total_xp + inserted_points, updated_at = now()
    where user_id = current_user_id;
  return inserted_points;
end;
$$;

create or replace function public.get_leaderboard()
returns table(rank bigint, display_name text, total_xp integer, level integer, is_current_user boolean)
language sql
security definer
set search_path = public, pg_temp
as $$
  select dense_rank() over (order by profile.total_xp desc), profile.display_name,
    profile.total_xp, floor(profile.total_xp / 100.0)::integer + 1,
    profile.user_id = auth.uid()
  from public.xp_profiles profile
  order by profile.total_xp desc, profile.updated_at asc
  limit 100;
$$;

revoke all on function public.sync_xp_profile(text) from public;
revoke all on function public.award_xp(text) from public;
revoke all on function public.get_leaderboard() from public;
grant execute on function public.sync_xp_profile(text) to authenticated;
grant execute on function public.award_xp(text) to authenticated;
grant execute on function public.get_leaderboard() to authenticated;
