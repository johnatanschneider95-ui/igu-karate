-- IGU Karatê · Fase 2 · rode DEPOIS do 01_schema.sql
-- 1) perfis de demonstração não têm login: a ligação obrigatória com auth.users sai
alter table profiles drop constraint if exists profiles_id_fkey;
alter table profiles alter column id set default gen_random_uuid();
alter table profiles add column if not exists belt_id int references belts(id);
alter table profiles add column if not exists joined_at date not null default current_date;

-- 2) fotos: só imagens, até 2 MB
update storage.buckets set file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id = 'avatars';

-- 3) trava mais forte: aluno não altera faixa, entrada, papel, status nem e-mail
create or replace function guard_profile_update() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if not is_staff() and (
     new.role <> old.role or new.status <> old.status or new.is_demo <> old.is_demo
     or new.belt_id is distinct from old.belt_id or new.joined_at <> old.joined_at
     or lower(new.email) <> lower(old.email)) then
    raise exception 'campo administrativo protegido';
  end if;
  if new.role <> old.role and not is_admin() then
    raise exception 'apenas administrador altera papéis';
  end if;
  if old.role in ('admin','professor') and old.id <> auth.uid() and not is_admin() then
    raise exception 'sem permissão sobre este perfil';
  end if;
  return new;
end $$;
