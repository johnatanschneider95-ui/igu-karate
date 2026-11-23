-- IGU Karatê · Fase 1 (fundação) · rode no SQL Editor do Supabase
create type app_role as enum ('admin','professor','aluno');
create type belt_track as enum ('infantil','regular'); -- infantil: menores de 10 anos
create type reg_status as enum ('pendente','aprovado','rejeitado','inativo');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  birth_date date,
  photo_path text,
  guardian_name text,
  guardian_phone text,
  role app_role not null default 'aluno',
  status reg_status not null default 'pendente',
  must_change_password boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  -- menores precisam de responsável
  constraint guardian_if_minor check (
    birth_date is null or birth_date <= (current_date - interval '18 years')
    or (guardian_name is not null and guardian_phone is not null))
);
-- trilha da faixa conforme a idade (referência: 10 anos)
create function belt_track_for(b date) returns belt_track
  language sql stable as $$ select case when b is not null and age(b) < interval '10 years'
  then 'infantil'::belt_track else 'regular'::belt_track end $$;
create unique index profiles_email_key on profiles (lower(email));

-- duas trilhas de faixas: infantil (menores de 10 anos) e regular (10 anos ou mais)
create table belts (
  id serial primary key,
  track belt_track not null,
  name text not null,
  color_hex text,
  position int not null,
  unique (track, name),
  unique (track, position)
);
insert into belts (track, name, color_hex, position) values
 ('infantil','Branca','#FFFFFF',1),('infantil','Cinza','#9A9AA5',2),
 ('infantil','Azul clara','#7FB8F0',3),('infantil','Amarela','#E8C547',4),
 ('infantil','Laranja','#E8893A',5),('infantil','Vermelha','#DF525B',6),
 ('infantil','Azul escura','#1F3F9E',7),('infantil','Verde','#77C49A',8),
 ('infantil','Roxa','#8A6FD1',9),('infantil','Marrom','#8B5E3C',10),
 ('infantil','Preta','#111111',11),
 ('regular','Branca','#FFFFFF',1),('regular','Amarela','#E8C547',2),
 ('regular','Laranja','#E8893A',3),('regular','Azul escura','#1F3F9E',4),
 ('regular','Verde','#77C49A',5),('regular','Roxa','#8A6FD1',6),
 ('regular','Marrom','#8B5E3C',7),('regular','Preta','#111111',8);

-- cronograma: um espaço por faixa, preenchido depois pelo professor/admin
create table belt_curriculum (
  id serial primary key,
  belt_id int not null references belts(id) on delete cascade,
  category text not null check (category in
    ('bases','defesa','ataque','kata','kumite','condicionamento','teoria','disciplina','observacoes')),
  title text not null,
  description text,
  position int not null default 0
);
-- na hora de graduar o sistema valida item a item (o professor decide, nunca automático)
create table student_curriculum_progress (
  student_id uuid not null references profiles(id) on delete cascade,
  item_id int not null references belt_curriculum(id) on delete cascade,
  state text not null default 'pendente' check (state in ('pendente','em_desenvolvimento','concluido')),
  validated_by uuid references profiles(id),
  validated_at timestamptz,
  primary key (student_id, item_id)
);

create table classes (
  id serial primary key,
  name text not null,
  weekdays int[] not null default '{}',
  start_time time,
  teacher_id uuid references profiles(id),
  active boolean not null default true
);

create table audit_log (
  id bigserial primary key,
  actor uuid references profiles(id),
  action text not null,
  target text,
  created_at timestamptz not null default now()
);

-- funções de permissão (security definer evita recursão nas policies)
create function current_role_() returns app_role
  language sql stable security definer set search_path = public as
  $$ select role from profiles where id = auth.uid() and status = 'aprovado' $$;
create function is_staff() returns boolean
  language sql stable as $$ select coalesce(current_role_() in ('admin','professor'), false) $$;
create function is_admin() returns boolean
  language sql stable as $$ select coalesce(current_role_() = 'admin', false) $$;

-- todo cadastro novo nasce como aluno PENDENTE (nunca escolhe o próprio papel)
create function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email, phone, birth_date, guardian_name, guardian_phone)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''), new.email,
    new.raw_user_meta_data->>'phone',
    nullif(new.raw_user_meta_data->>'birth_date','')::date,
    new.raw_user_meta_data->>'guardian_name',
    new.raw_user_meta_data->>'guardian_phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table belts enable row level security;
alter table belt_curriculum enable row level security;
alter table student_curriculum_progress enable row level security;
alter table classes enable row level security;
alter table audit_log enable row level security;

create policy profiles_self_read on profiles for select using (id = auth.uid());
create policy profiles_staff_read on profiles for select using (is_staff());
-- aluno edita só contato/foto/responsável; papel, status e flags ficam travados no trigger abaixo
create policy profiles_self_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_staff_update on profiles for update using (is_staff());
create policy profiles_admin_all on profiles for all using (is_admin());

create function guard_profile_update() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_staff() and (
     new.role <> old.role or new.status <> old.status or new.is_demo <> old.is_demo) then
    raise exception 'campo administrativo protegido';
  end if;
  if new.role <> old.role and not is_admin() and auth.uid() is not null then
    raise exception 'apenas administrador altera papéis';
  end if;
  return new;
end $$;
create trigger profiles_guard before update on profiles
  for each row execute function guard_profile_update();

create policy belts_read on belts for select using (auth.uid() is not null);
create policy belts_admin on belts for all using (is_admin());
create policy curriculum_read on belt_curriculum for select using (auth.uid() is not null);
create policy curriculum_staff on belt_curriculum for all using (is_staff());
create policy progress_own_read on student_curriculum_progress for select using (student_id = auth.uid());
create policy progress_staff on student_curriculum_progress for all using (is_staff());
create policy classes_read on classes for select using (is_staff());
create policy classes_admin on classes for all using (is_admin());
create policy audit_admin_read on audit_log for select using (is_admin());
create policy audit_staff_insert on audit_log for insert with check (is_staff());

-- foto privada (bucket sem acesso público)
insert into storage.buckets (id, name, public) values ('avatars','avatars',false) on conflict do nothing;
create policy avatars_own on storage.objects for all
  using (bucket_id='avatars' and (owner = auth.uid() or is_staff()))
  with check (bucket_id='avatars' and owner = auth.uid());
