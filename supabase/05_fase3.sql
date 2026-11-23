-- IGU Karatê · Fase 3 · rode DEPOIS do 03_fase2.sql
create table attendance_sessions (
  id bigserial primary key,
  class_id int not null references classes(id),
  session_date date not null,
  teacher_id uuid references profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  unique (class_id, session_date)            -- impede chamada duplicada na mesma turma e data
);
create table attendance_records (
  session_id bigint not null references attendance_sessions(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  present boolean not null,
  note text,
  primary key (session_id, student_id)
);
create table graduations (
  id bigserial primary key,
  student_id uuid not null references profiles(id) on delete cascade,
  from_belt_id int references belts(id),
  to_belt_id int not null references belts(id),
  exam_date date,
  approved_date date not null default current_date,
  teacher_id uuid references profiles(id),
  teacher_name text,
  notes text,
  created_at timestamptz not null default now()
);
create table evolution_notes (
  id bigserial primary key,
  student_id uuid not null references profiles(id) on delete cascade,
  teacher_id uuid references profiles(id),
  teacher_name text,
  category text not null,
  content text not null,
  private boolean not null default false,
  created_at timestamptz not null default now()
);

-- frequência = presenças ÷ chamadas registradas do aluno (security_invoker respeita a RLS)
create view student_attendance with (security_invoker = true) as
  select student_id, count(*)::int as total, (count(*) filter (where present))::int as presentes
  from attendance_records group by student_id;

alter table attendance_sessions enable row level security;
alter table attendance_records enable row level security;
alter table graduations enable row level security;
alter table evolution_notes enable row level security;

create policy sess_staff on attendance_sessions for all using (is_staff()) with check (is_staff());
create policy sess_own_read on attendance_sessions for select using (
  exists (select 1 from attendance_records r where r.session_id = id and r.student_id = auth.uid()));
create policy rec_staff on attendance_records for all using (is_staff()) with check (is_staff());
create policy rec_own_read on attendance_records for select using (student_id = auth.uid());
create policy grad_staff on graduations for all using (is_staff()) with check (is_staff());
create policy grad_own_read on graduations for select using (student_id = auth.uid());
create policy evo_staff on evolution_notes for all using (is_staff()) with check (is_staff());
create policy evo_own_read on evolution_notes for select using (student_id = auth.uid() and not private);

-- turmas: qualquer usuário logado lê (nome aparece no histórico do aluno); professores criam e editam
drop policy if exists classes_read on classes;
drop policy if exists classes_admin on classes;
create policy classes_read on classes for select using (auth.uid() is not null);
create policy classes_staff on classes for all using (is_staff()) with check (is_staff());

-- graduar: registra no histórico e atualiza a faixa atual numa única operação
create function registrar_graduacao(p_student uuid, p_to_belt int, p_exam date, p_approved date, p_notes text)
returns void language plpgsql security definer set search_path = public as $$
declare cur int; tname text;
begin
  if not is_staff() then raise exception 'sem permissão'; end if;
  if not exists (select 1 from belts where id = p_to_belt) then raise exception 'faixa inválida'; end if;
  select belt_id into cur from profiles where id = p_student and role = 'aluno';
  if not found then raise exception 'aluno não encontrado'; end if;
  select full_name into tname from profiles where id = auth.uid();
  insert into graduations (student_id, from_belt_id, to_belt_id, exam_date, approved_date, teacher_id, teacher_name, notes)
    values (p_student, cur, p_to_belt, p_exam, p_approved, auth.uid(), tname, p_notes);
  update profiles set belt_id = p_to_belt where id = p_student;
  insert into audit_log (actor, action, target) values (auth.uid(), 'registrou_graduacao', p_student::text);
end $$;
