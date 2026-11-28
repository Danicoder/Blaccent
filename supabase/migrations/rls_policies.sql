create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  origin text not null,
  destination text not null default 'Panoramis' check (destination = 'Panoramis'),
  travel_date date not null,
  departure_time time not null,
  arrival_time time,
  return_time time,
  mode text not null check (mode in ('outbound', 'inbound', 'both')),
  seats integer not null check (seats between 1 and 8),
  outbound_seats integer not null default 0 check (outbound_seats >= 0),
  return_seats integer not null default 0 check (return_seats >= 0),
  parking text not null check (parking in ('panoramis', 'free')),
  created_at timestamptz not null default now()
);

alter table public.trips
  add column if not exists distance_km numeric(8,2),
  add column if not exists outbound_distance_km numeric(8,2),
  add column if not exists return_distance_km numeric(8,2);

alter table public.trips enable row level security;

drop policy if exists "trips_authenticated_select" on public.trips;
create policy "trips_authenticated_select"
  on public.trips for select
  to authenticated
  using (true);

drop policy if exists "trips_driver_insert" on public.trips;
create policy "trips_driver_insert"
  on public.trips for insert
  to authenticated
  with check (driver_id = auth.uid());

drop policy if exists "trips_driver_update" on public.trips;
create policy "trips_driver_update"
  on public.trips for update
  to authenticated
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

create or replace function public.enforce_accenture_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(split_part(new.email, '@', 2), '')) <> 'accenture.com' then
    raise exception 'Solo se permiten correos @accenture.com';
  end;
  return new;
end;
$$;

drop trigger if exists enforce_accenture_email on auth.users;
create trigger enforce_accenture_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_accenture_email();

create table if not exists public.origin_favorites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  label text not null check (char_length(trim(label)) between 1 and 60),
  address text not null check (char_length(trim(address)) between 1 and 300),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  created_at timestamptz not null default now()
);

alter table public.origin_favorites enable row level security;

drop policy if exists "origin_favorites_owner_select" on public.origin_favorites;
create policy "origin_favorites_owner_select"
  on public.origin_favorites for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "origin_favorites_owner_insert" on public.origin_favorites;
create policy "origin_favorites_owner_insert"
  on public.origin_favorites for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "origin_favorites_owner_update" on public.origin_favorites;
create policy "origin_favorites_owner_update"
  on public.origin_favorites for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "origin_favorites_owner_delete" on public.origin_favorites;
create policy "origin_favorites_owner_delete"
  on public.origin_favorites for delete
  to authenticated
  using (owner_id = auth.uid());

revoke all on public.origin_favorites from anon;
grant select, insert, update, delete on public.origin_favorites to authenticated;