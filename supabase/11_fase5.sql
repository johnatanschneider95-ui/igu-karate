-- IGU Karatê · Fase 5 (conquistas, certificados, base para responsáveis) · rode DEPOIS do 09_fase4.sql

create table achievements (
  id bigserial primary key,
  student_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  achieved_on date not null default current_date,
  category text not null default 'medalha'
    check (category in ('medalha','campeonato','participacao','colocacao','evolucao','superacao','reconhecimento','disciplina','especial')),
  image_path text,
  teacher_id uuid references profiles(id),
  teacher_name text,
  created_at timestamptz not null default now()
);
create table certificates (
  id bigserial primary key,
  student_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('participacao','campeonato','graduacao','reconhecimento')),
  title text not null,
  issued_on date not null default current_date,
  notes text,
  teacher_id uuid references profiles(id),
  teacher_name text,
  created_at timestamptz not null default now()
);
-- PREPARAÇÃO FUTURA: área dos responsáveis (ainda sem telas)
alter type app_role add value if not exists 'responsavel';
create table guardian_links (
  guardian_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  relationship text,
  created_at timestamptz not null default now(),
  primary key (guardian_id, student_id)
);

alter table achievements enable row level security;
alter table certificates enable row level security;
alter table guardian_links enable row level security;

create policy ach_staff on achievements for all using (is_staff()) with check (is_staff());
create policy ach_own_read on achievements for select using (student_id = auth.uid());
create policy cert_staff on certificates for all using (is_staff()) with check (is_staff());
create policy cert_own_read on certificates for select using (student_id = auth.uid());
create policy guardian_staff on guardian_links for all using (is_staff()) with check (is_staff());
create policy guardian_own_read on guardian_links for select using (guardian_id = auth.uid());
