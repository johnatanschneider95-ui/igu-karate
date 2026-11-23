-- IGU Karatê · Fase 4 (avisos, calendário, eventos) + excluir turma · rode DEPOIS do 07_turmas_auto.sql

-- ===== TURMAS: excluir com segurança =====
alter table profiles drop constraint if exists profiles_class_id_fkey;
alter table profiles add constraint profiles_class_id_fkey
  foreign key (class_id) references classes(id) on delete set null;

-- a turma só é recalculada ao cadastrar ou ao mudar a data de nascimento
create or replace function set_student_class() returns trigger language plpgsql as $$
begin
  if new.role = 'aluno' then
    if tg_op = 'INSERT' then new.class_id := class_for(new.birth_date);
    elsif new.birth_date is distinct from old.birth_date then new.class_id := class_for(new.birth_date);
    end if;
  end if;
  return new;
end $$;

-- turma com chamadas registradas NÃO pode ser excluída (preserva o histórico); use Desativar
create or replace function excluir_turma(p_id int) returns void
  language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then raise exception 'sem permissão'; end if;
  if exists (select 1 from attendance_sessions where class_id = p_id) then
    raise exception 'turma_com_chamadas';
  end if;
  update profiles set class_id = null where class_id = p_id;
  delete from classes where id = p_id;
  insert into audit_log (actor, action, target) values (auth.uid(), 'excluiu_turma', p_id::text);
end $$;

create or replace function criar_turmas_padrao() returns void
  language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then raise exception 'sem permissão'; end if;
  insert into classes (name, weekdays, start_time, kind) values
    ('Kids', '{2,4}', '17:30', 'kids'), ('Turma Livre', '{2,4}', '19:00', 'livre')
  on conflict (kind) do nothing;
  update profiles set class_id = class_for(birth_date)
   where role = 'aluno' and class_id is distinct from class_for(birth_date);
end $$;

-- ===== VISIBILIDADE POR PÚBLICO =====
create function my_class_kind() returns text language sql stable security definer set search_path = public as $$
  select c.kind from profiles p join classes c on c.id = p.class_id
  where p.id = auth.uid() and p.status = 'aprovado' $$;
create function can_see_audience(a text) returns boolean language sql stable as $$
  select is_staff()
      or (a = 'todos' and current_role_() is not null)
      or (a in ('kids','livre') and a = my_class_kind()) $$;

-- ===== EVENTOS =====
create table events (
  id bigserial primary key,
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  category text not null default 'treino'
    check (category in ('treino','exame','campeonato','reuniao','apresentacao','social','comemorativa')),
  audience text not null default 'todos' check (audience in ('todos','kids','livre','professores')),
  notes text,
  image_path text,
  author_id uuid references profiles(id),
  created_at timestamptz not null default now()
);
create table event_rsvps (
  event_id bigint not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('vou','nao_vou')),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ===== AVISOS =====
create table announcements (
  id bigserial primary key,
  title text not null,
  body text not null,
  category text not null default 'geral'
    check (category in ('geral','treinos','campeonatos','graduacoes','eventos','uniformes','alteracoes','instituto')),
  audience text not null default 'todos' check (audience in ('todos','kids','livre','professores')),
  published_on date not null default current_date,
  valid_until date,
  pinned boolean not null default false,
  important boolean not null default false,
  image_path text,
  event_id bigint references events(id) on delete set null,
  author_id uuid references profiles(id),
  author_name text,
  created_at timestamptz not null default now()
);
create table announcement_reads (
  announcement_id bigint not null references announcements(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table announcements enable row level security;
alter table announcement_reads enable row level security;

create policy events_staff on events for all using (is_staff()) with check (is_staff());
create policy events_read on events for select using (can_see_audience(audience));
create policy rsvp_own on event_rsvps for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy rsvp_staff_read on event_rsvps for select using (is_staff());
create policy ann_staff on announcements for all using (is_staff()) with check (is_staff());
create policy ann_read on announcements for select using (can_see_audience(audience));
create policy reads_own on announcement_reads for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reads_staff_read on announcement_reads for select using (is_staff());

-- ===== IMAGENS (avisos e eventos): bucket privado, só imagens até 2 MB =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy media_read on storage.objects for select using (bucket_id = 'media' and auth.uid() is not null);
create policy media_staff_write on storage.objects for all
  using (bucket_id = 'media' and is_staff()) with check (bucket_id = 'media' and is_staff());
