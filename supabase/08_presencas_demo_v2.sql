-- Substitui as chamadas fictícias antigas: 12 semanas em cada turma, só com os alunos demo daquela turma.
do $$
declare c record; r record; sid bigint; s int;
begin
  delete from attendance_sessions where class_id in (select id from classes where name like '%(demo)');
  delete from classes where name like '%(demo)';
  for c in select id from classes where kind is not null loop
    for s in 1..12 loop
      sid := null;
      insert into attendance_sessions (class_id, session_date) values (c.id, current_date - (s * 7 - 2))
        on conflict do nothing returning id into sid;
      if sid is null then continue; end if;
      for r in select id, row_number() over (order by email) as i from profiles
               where is_demo and status = 'aprovado' and class_id = c.id loop
        insert into attendance_records (session_id, student_id, present)
        values (sid, r.id, ((r.i * 7 + s * 13) % 10) >= ((r.i % 5) * 2));
      end loop;
    end loop;
  end loop;
end $$;
