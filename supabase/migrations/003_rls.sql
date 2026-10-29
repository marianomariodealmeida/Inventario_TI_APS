-- =========================================================
-- Habilita RLS em tudo
-- =========================================================
alter table public.units           enable row level security;
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.assets          enable row level security;
alter table public.asset_movements enable row level security;
alter table public.tickets         enable row level security;

-- ---------- helpers de checagem ----------
create or replace function public.is_global_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select role = 'global_admin' from public.current_profile()), false);
$$;

create or replace function public.my_unit_id()
returns uuid language sql security definer stable set search_path = public as $$
  select unit_id from public.current_profile();
$$;

-- =========================================================
-- UNITS
-- =========================================================
create policy units_read on public.units
  for select to authenticated
  using (public.is_global_admin() or id = public.my_unit_id());

create policy units_write on public.units
  for all to authenticated
  using (public.is_global_admin())
  with check (public.is_global_admin());

-- =========================================================
-- PROFILES
-- =========================================================
create policy profiles_read on public.profiles
  for select to authenticated
  using (
    public.is_global_admin()
    or id = auth.uid()
    or (unit_id is not null and unit_id = public.my_unit_id())
  );

create policy profiles_admin_write on public.profiles
  for all to authenticated
  using (public.is_global_admin())
  with check (public.is_global_admin());

-- =========================================================
-- CATEGORIES
-- =========================================================
create policy categories_read on public.categories
  for select to authenticated using (true);

create policy categories_write on public.categories
  for all to authenticated
  using (public.is_global_admin())
  with check (public.is_global_admin());

-- =========================================================
-- ASSETS
-- =========================================================
create policy assets_read on public.assets
  for select to authenticated
  using (public.is_global_admin() or unit_id = public.my_unit_id());

create policy assets_insert on public.assets
  for insert to authenticated
  with check (
    public.is_global_admin() or unit_id = public.my_unit_id()
  );

create policy assets_update on public.assets
  for update to authenticated
  using (public.is_global_admin() or unit_id = public.my_unit_id())
  with check (
    public.is_global_admin() or unit_id = public.my_unit_id()
  );

create policy assets_delete on public.assets
  for delete to authenticated
  using (public.is_global_admin() or unit_id = public.my_unit_id());

-- =========================================================
-- ASSET MOVEMENTS
-- =========================================================
create policy movements_read on public.asset_movements
  for select to authenticated
  using (
    public.is_global_admin()
    or exists (
      select 1 from public.assets a
      where a.id = asset_id and a.unit_id = public.my_unit_id()
    )
  );

create policy movements_insert on public.asset_movements
  for insert to authenticated
  with check (
    public.is_global_admin()
    or exists (
      select 1 from public.assets a
      where a.id = asset_id and a.unit_id = public.my_unit_id()
    )
  );

-- =========================================================
-- TICKETS
-- =========================================================
create policy tickets_read on public.tickets
  for select to authenticated
  using (public.is_global_admin() or unit_id = public.my_unit_id());

create policy tickets_write on public.tickets
  for all to authenticated
  using (public.is_global_admin() or unit_id = public.my_unit_id())
  with check (public.is_global_admin() or unit_id = public.my_unit_id());
