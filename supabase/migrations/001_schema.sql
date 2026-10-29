-- =========================================================
-- 1. Enums, unidades, perfis, categorias, ativos, movimentos, chamados
-- =========================================================
create extension if not exists "pgcrypto";

create type public.app_role as enum ('global_admin', 'unit_admin');
create type public.unit_type as enum ('headquarters', 'school');
create type public.asset_status as enum ('active', 'in_transfer', 'deactivated', 'maintenance');
create type public.movement_type as enum ('transfer', 'deactivation', 'reactivation', 'status_change');
create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'cancelled');

create table public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.unit_type not null default 'school',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  role public.app_role not null default 'unit_admin',
  full_name text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  form_schema jsonb not null default '{"fields":[]}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  asset_number text not null,
  serial_number text,
  brand text,
  model text,
  origin text not null,
  status public.asset_status not null default 'active',
  specs jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, asset_number)
);

create index assets_unit_idx on public.assets(unit_id);
create index assets_category_idx on public.assets(category_id);
create index assets_status_idx on public.assets(status);

create table public.asset_movements (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  from_unit_id uuid references public.units(id),
  to_unit_id uuid references public.units(id),
  movement_type public.movement_type not null,
  reason text,
  performed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index movements_asset_idx on public.asset_movements(asset_id);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  asset_id uuid not null references public.assets(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  title text not null,
  description text,
  status public.ticket_status not null default 'open',
  opened_by uuid references public.profiles(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create index tickets_asset_idx on public.tickets(asset_id);
create index tickets_unit_idx on public.tickets(unit_id);

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assets_touch_updated_at
before update on public.assets
for each row execute function public.touch_updated_at();
