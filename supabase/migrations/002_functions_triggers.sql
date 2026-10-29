-- =========================================================
-- Função de perfil atual (usada nas policies)
-- =========================================================
create or replace function public.current_profile()
returns table (role public.app_role, unit_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select role, unit_id from public.profiles where id = auth.uid();
$$;

-- =========================================================
-- Cria perfil automaticamente ao criar usuário no auth
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
