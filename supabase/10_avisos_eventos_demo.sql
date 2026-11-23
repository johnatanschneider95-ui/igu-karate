-- Dados de demonstração (opcional). Para remover:
--   delete from announcements where title like '%(demo)';  delete from events where title like '%(demo)';
insert into events (title, description, event_date, event_time, location, category, audience) values
 ('Treino especial (demo)', 'Treino aberto com foco em kata.', current_date + 3, '18:00', 'Ginásio do Instituto', 'treino', 'todos'),
 ('Exame de faixa (demo)', 'Traga o uniforme completo.', current_date + 14, '09:00', 'Ginásio do Instituto', 'exame', 'todos'),
 ('Campeonato regional (demo)', 'Inscrições com o professor.', current_date + 28, '08:00', 'Ginásio Municipal', 'campeonato', 'todos'),
 ('Festa da turma Kids (demo)', 'Confraternização com as famílias.', current_date + 10, '15:00', 'Salão do Instituto', 'social', 'kids');
insert into announcements (title, body, category, audience, important, pinned, author_name, event_id) values
 ('Exame de faixa em breve (demo)', 'O exame está marcado. Revise o cronograma da sua faixa e fale com o professor em caso de dúvida.', 'graduacoes', 'todos', true, true, 'Demonstração',
   (select id from events where title = 'Exame de faixa em breve (demo)' or title = 'Exame de faixa (demo)' limit 1)),
 ('Uniforme limpo e completo (demo)', 'Lembrem de vir com o uniforme limpo. Qualquer dificuldade, procure o professor.', 'uniformes', 'todos', false, false, 'Demonstração', null),
 ('Reunião de pais da turma Kids (demo)', 'Convidamos os responsáveis para conversar sobre o semestre.', 'instituto', 'kids', false, false, 'Demonstração', null);
