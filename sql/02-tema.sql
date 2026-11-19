alter table public.perfiles add column if not exists tema text;

create or replace function public.guardar_tema(p_tema text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.perfiles set tema = left(p_tema, 60) where id = auth.uid()
$$;

grant execute on function public.guardar_tema(text) to authenticated;
