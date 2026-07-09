-- EVOTEL Hotel PMS — multi-tenant auth schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Safe to re-run: each statement guards against re-creation where practical.

-- ─────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────

-- One row per vendor/property. Every tenant-scoped table (rooms, guests,
-- reservations, etc., added in a later phase) will reference hotels.id.
create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Links a Supabase auth user to the one hotel they administer. One profile
-- per auth user; one hotel per profile (multi-staff-per-hotel can be added
-- later by relaxing this to a join table).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  full_name text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists profiles_hotel_id_idx on public.profiles (hotel_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────

alter table public.hotels enable row level security;
alter table public.profiles enable row level security;

-- A vendor can only see/update their own hotel row.
drop policy if exists "hotels: select own" on public.hotels;
create policy "hotels: select own" on public.hotels
  for select using (id in (select hotel_id from public.profiles where id = auth.uid()));

drop policy if exists "hotels: update own" on public.hotels;
create policy "hotels: update own" on public.hotels
  for update using (id in (select hotel_id from public.profiles where id = auth.uid()));

-- A vendor can only see/update their own profile row.
drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- Sign-up helper
-- ─────────────────────────────────────────────────────────────────────────

-- Creates a hotel + profile for the currently-authenticated user in one
-- transaction, called right after supabase.auth.signUp() succeeds. Runs as
-- the calling user (not a superuser bypass), relying on the insert
-- policies below rather than SECURITY DEFINER.
drop policy if exists "hotels: insert own" on public.hotels;
create policy "hotels: insert own" on public.hotels
  for insert with check (true);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (id = auth.uid());

create or replace function public.create_hotel_and_profile(hotel_name text, admin_name text)
returns public.profiles
language plpgsql
security invoker
as $$
declare
  new_hotel_id uuid;
  new_profile public.profiles;
begin
  insert into public.hotels (name) values (hotel_name) returning id into new_hotel_id;

  insert into public.profiles (id, hotel_id, full_name)
  values (auth.uid(), new_hotel_id, admin_name)
  returning * into new_profile;

  return new_profile;
end;
$$;
