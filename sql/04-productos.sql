alter table public.renglones add column if not exists productos jsonb;

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
  insert into public.renglones (vale_id, orden, concepto, tipo, clase, fecha, monto, galones, gal_trans, cargo, destino, detalle, mes_anterior, viajes, factura, productos)
  select v_id, (r.ord - 1)::int, r.x ->> 'concepto', r.x ->> 'tipo', nullif(r.x ->> 'clase', ''),
         nullif(r.x ->> 'fecha', '')::date, nullif(r.x ->> 'monto', '')::numeric, nullif(r.x ->> 'galones', '')::numeric,
         nullif(r.x ->> 'gal_trans', '')::numeric, nullif(r.x ->> 'cargo', ''), r.x ->> 'destino', r.x ->> 'detalle',
         coalesce((r.x ->> 'mes_anterior')::boolean, false), r.x -> 'viajes', r.x -> 'factura',
         case when jsonb_typeof(r.x -> 'productos') = 'object' then r.x -> 'productos' end
  from jsonb_array_elements(coalesce(p_renglones, '[]'::jsonb)) with ordinality as r(x, ord);
  return v_id;
end;
$$;

grant execute on function public.guardar_vale(jsonb, jsonb) to authenticated;
