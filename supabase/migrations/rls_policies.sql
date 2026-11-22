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