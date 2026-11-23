-- IGU Karatê · turmas automáticas · rode DEPOIS do 05_fase3.sql
alter table classes add column if not exists kind text unique check (kind in ('kids','livre'));
alter table profiles add column if not exists class_id int references classes(id);

-- as duas turmas oficiais (ajuste dias e horário depois, na tela Turmas do app)
insert into classes (name, weekdays, start_time, kind) values
  ('Kids',        '{2,4}', '17:30', 'kids'),
  ('Turma Livre', '{2,4}', '19:00', 'livre')
on conflict (kind) do nothing;

-- menos de 10 anos = Kids; 10 anos ou mais = Turma Livre
create or replace function class_for(b date) returns int language sql stable as $$
  select id from classes
  where kind = case when b is not null and age(b) < interval '10 years' then 'kids' else 'livre' end $$;

create or replace function set_student_class() returns trigger language plpgsql as $$
begin
  if new.role = 'aluno' then
    if tg_op = 'INSERT' then
      new.class_id := class_for(new.birth_date);
    elsif new.birth_date is distinct from old.birth_date or new.class_id is null then
      new.class_id := class_for(new.birth_date);
    end if;
  end if;
  return new;
end $$;
drop trigger if exists profiles_set_class on profiles;
create trigger profiles_set_class before insert or update on profiles
  for each row execute function set_student_class();

-- aluno não muda a própria turma nem a data de nascimento
create or replace function guard_profile_update() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if not is_staff() and (
     new.role <> old.role or new.status <> old.status or new.is_demo <> old.is_demo
     or new.belt_id is distinct from old.belt_id or new.joined_at <> old.joined_at
     or new.class_id is distinct from old.class_id or new.birth_date is distinct from old.birth_date
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

-- quem já existe entra na turma certa agora
update profiles set class_id = class_for(birth_date) where role = 'aluno';

-- reajuste por idade (quem faz 10 anos passa para a Turma Livre); o app chama ao abrir a chamada
create or replace function reatribuir_turmas() returns int
  language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not is_staff() then raise exception 'sem permissão'; end if;
  update profiles set class_id = class_for(birth_date)
   where role = 'aluno' and class_id is distinct from class_for(birth_date);
  get diagnostics n = row_count;
  return n;
end $$;
