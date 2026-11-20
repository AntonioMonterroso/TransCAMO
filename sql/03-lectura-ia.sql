create table if not exists public.lecturas_ia (
  usuario uuid not null references auth.users (id) on delete cascade,
  dia date not null,
  n integer not null default 0,
  primary key (usuario, dia)
);

alter table public.lecturas_ia enable row level security;

revoke all on public.lecturas_ia from anon, authenticated;

create or replace function public.usar_lecturas(p_n integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dia date := (now() at time zone 'America/Guatemala')::date;
  v_tope constant integer := 300;
  v_n integer;
begin
  if auth.uid() is null then
    raise exception 'sin_sesion';
  end if;
  if coalesce(public.mi_rol(), '') not in ('admin', 'captura') then
    raise exception 'sin_permiso';
  end if;
  if p_n is null or p_n < 1 or p_n > 20 then
    raise exception 'cantidad_invalida';
  end if;
  insert into public.lecturas_ia (usuario, dia, n)
  values (auth.uid(), v_dia, 0)
  on conflict (usuario, dia) do nothing;
  select n into v_n from public.lecturas_ia where usuario = auth.uid() and dia = v_dia for update;
  if v_n + p_n > v_tope then
    raise exception 'tope_diario:%', v_tope - v_n;
  end if;
  update public.lecturas_ia set n = n + p_n where usuario = auth.uid() and dia = v_dia;
  return v_tope - v_n - p_n;
end;
$$;

revoke all on function public.usar_lecturas(integer) from public, anon;
grant execute on function public.usar_lecturas(integer) to authenticated;
