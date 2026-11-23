-- Demonstração (opcional). Para remover:
--  delete from achievements where title like '%(demo)';
insert into achievements (student_id, title, description, achieved_on, category, teacher_name)
select id, 'Medalha de prata no torneio regional (demo)', 'Kumite', current_date - 40, 'medalha', 'Demonstração'
from profiles where is_demo and status = 'aprovado' order by email limit 5;
insert into achievements (student_id, title, description, achieved_on, category, teacher_name)
select id, 'Superação nos treinos (demo)', 'Evolução constante ao longo do semestre.', current_date - 15, 'superacao', 'Demonstração'
from profiles where is_demo and status = 'aprovado' order by email offset 5 limit 5;
