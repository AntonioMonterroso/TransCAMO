create extension if not exists pgcrypto;

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  correo text,
  rol text not null default 'captura' check (rol in ('admin', 'captura', 'lector')),
  creado_en timestamptz not null default now()
);

create table if not exists public.vales (
  id uuid primary key default gen_random_uuid(),
  mes date not null,
  unidad text not null check (unidad in ('TS01', 'TS02', 'TS03', 'TS04', 'Rastra', 'TACOMA')),
  numero text,
  fecha date,
  total numeric(14, 2),
  piloto text,
  placa text,
  notas text,
  creado_por uuid default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  editado_por uuid references auth.users (id),
  editado_en timestamptz
);
create index if not exists vales_mes_idx on public.vales (mes, unidad);

create table if not exists public.renglones (
  id uuid primary key default gen_random_uuid(),
  vale_id uuid not null references public.vales (id) on delete cascade,
  orden int not null default 0,
  concepto text not null,
  tipo text not null check (tipo in ('combustible', 'viatico', 'gasto')),
  clase text check (clase in ('reparacion', 'sueldo')),
  fecha date,
  monto numeric(14, 2),
  galones numeric(14, 3),
  gal_trans numeric(14, 2),
  cargo text check (cargo in ('puma', 'santander', 'camo')),
  destino text,
  detalle text,
  mes_anterior boolean not null default false,
  viajes jsonb,
  factura jsonb
);
create index if not exists renglones_vale_idx on public.renglones (vale_id);

create table if not exists public.meses (
  mes date primary key,
  datos jsonb not null default '{}'::jsonb,
  actualizado_por uuid default auth.uid() references auth.users (id),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.facturas (
  id uuid primary key default gen_random_uuid(),
  mes date not null,
  orden int not null default 0,
  fecha date,
  factura text,
  nit text,
  proveedor text,
  monto numeric(14, 2),
  descripcion text,
  creado_por uuid default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now()
);
create index if not exists facturas_mes_idx on public.facturas (mes);

create or replace function public.mi_rol()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid()
$$;

create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, correo, rol)
  values (new.id, split_part(new.email, '@', 1), new.email,
          case when (select count(*) from public.perfiles) = 0 then 'admin' else 'captura' end)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

alter table public.perfiles enable row level security;
alter table public.vales enable row level security;
alter table public.renglones enable row level security;
alter table public.meses enable row level security;
alter table public.facturas enable row level security;

drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = auth.uid() or public.mi_rol() = 'admin');
drop policy if exists perfiles_admin on public.perfiles;
create policy perfiles_admin on public.perfiles for update to authenticated
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

do $$
declare t text;
begin
  foreach t in array array['vales', 'renglones', 'meses', 'facturas'] loop
    execute format('drop policy if exists %I on public.%I', t || '_ver', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.mi_rol() in (''admin'', ''captura'', ''lector''))', t || '_ver', t);
    execute format('drop policy if exists %I on public.%I', t || '_crear', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.mi_rol() in (''admin'', ''captura''))', t || '_crear', t);
    execute format('drop policy if exists %I on public.%I', t || '_cambiar', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.mi_rol() in (''admin'', ''captura'')) with check (public.mi_rol() in (''admin'', ''captura''))', t || '_cambiar', t);
    execute format('drop policy if exists %I on public.%I', t || '_borrar', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.mi_rol() in (''admin'', ''captura''))', t || '_borrar', t);
  end loop;
end $$;

create or replace function public.guardar_vale(p_vale jsonb, p_renglones jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid := nullif(p_vale ->> 'id', '')::uuid;
begin
  if public.mi_rol() not in ('admin', 'captura') then
    raise exception 'Sin permiso para guardar vales';
  end if;
  if v_id is null then
    insert into public.vales (mes, unidad, numero, fecha, total, piloto, placa, notas)
    values ((p_vale ->> 'mes')::date, p_vale ->> 'unidad', p_vale ->> 'numero', nullif(p_vale ->> 'fecha', '')::date,
            nullif(p_vale ->> 'total', '')::numeric, p_vale ->> 'piloto', p_vale ->> 'placa', p_vale ->> 'notas')
    returning id into v_id;
  else
    update public.vales set
      mes = (p_vale ->> 'mes')::date,
      unidad = p_vale ->> 'unidad',
      numero = p_vale ->> 'numero',
      fecha = nullif(p_vale ->> 'fecha', '')::date,
      total = nullif(p_vale ->> 'total', '')::numeric,
      piloto = p_vale ->> 'piloto',
      placa = p_vale ->> 'placa',
      notas = p_vale ->> 'notas',
      editado_por = auth.uid(),
      editado_en = now()
    where id = v_id;
    delete from public.renglones where vale_id = v_id;
  end if;
  insert into public.renglones (vale_id, orden, concepto, tipo, clase, fecha, monto, galones, gal_trans, cargo, destino, detalle, mes_anterior, viajes, factura)
  select v_id, (r.ord - 1)::int, r.x ->> 'concepto', r.x ->> 'tipo', nullif(r.x ->> 'clase', ''),
         nullif(r.x ->> 'fecha', '')::date, nullif(r.x ->> 'monto', '')::numeric, nullif(r.x ->> 'galones', '')::numeric,
         nullif(r.x ->> 'gal_trans', '')::numeric, nullif(r.x ->> 'cargo', ''), r.x ->> 'destino', r.x ->> 'detalle',
         coalesce((r.x ->> 'mes_anterior')::boolean, false), r.x -> 'viajes', r.x -> 'factura'
  from jsonb_array_elements(coalesce(p_renglones, '[]'::jsonb)) with ordinality as r(x, ord);
  return v_id;
end;
$$;

grant execute on function public.guardar_vale(jsonb, jsonb) to authenticated;
grant execute on function public.mi_rol() to authenticated;

insert into storage.buckets (id, name, public)
values ('plantillas', 'plantillas', false)
on conflict (id) do nothing;

drop policy if exists plantillas_ver on storage.objects;
create policy plantillas_ver on storage.objects for select to authenticated
  using (bucket_id = 'plantillas' and public.mi_rol() in ('admin', 'captura', 'lector'));
drop policy if exists plantillas_subir on storage.objects;
create policy plantillas_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'plantillas' and public.mi_rol() = 'admin');
drop policy if exists plantillas_cambiar on storage.objects;
create policy plantillas_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'plantillas' and public.mi_rol() = 'admin');
drop policy if exists plantillas_borrar on storage.objects;
create policy plantillas_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'plantillas' and public.mi_rol() = 'admin');

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.vales, public.renglones, public.meses, public.facturas to authenticated;
grant select, update on public.perfiles to authenticated;
revoke all on public.vales, public.renglones, public.meses, public.facturas, public.perfiles from anon;
