-- 35 alunos fictícios (28 ativos, 4 pendentes, 3 inativos). Sem login.
-- Para remover depois: delete from profiles where is_demo;
do $$
declare
  nomes text[] := array['Ana Souza','Bruno Lima','Carla Mendes','Daniel Rocha','Eduarda Alves','Felipe Costa','Gabriela Nunes','Henrique Dias','Isabela Martins','João Pedro Ramos','Kauã Ribeiro','Larissa Freitas','Miguel Araújo','Natália Barros','Otávio Pires','Paula Teixeira','Rafael Moraes','Sofia Cardoso','Thiago Lopes','Valentina Reis','Yuri Campos','Beatriz Farias','Caio Azevedo','Diana Cunha','Enzo Batista','Fernanda Melo','Guilherme Neves','Helena Duarte','Igor Santana','Julia Peixoto','Lucas Vieira','Marina Gomes','Nicolas Prado','Olivia Castro','Pedro Henrique Lins'];
  i int; nasc date; st reg_status; tr belt_track; n int; b int; a int;
begin
  for i in 1..35 loop
    a := 6 + (i * 7) % 30;                       -- idades entre 6 e 35
    nasc := current_date - (a * 365 + (i * 53) % 365);
    st := case when i <= 28 then 'aprovado' when i <= 32 then 'pendente' else 'inativo' end;
    b := null;
    if st <> 'pendente' then
      tr := belt_track_for(nasc);
      select count(*) into n from belts where track = tr;
      select id into b from belts where track = tr order by position offset ((i * 3) % n) limit 1;
    end if;
    insert into profiles (full_name, email, phone, birth_date, guardian_name, guardian_phone,
                          role, status, is_demo, belt_id, joined_at)
    values (nomes[i], 'demo' || lpad(i::text, 2, '0') || '@demo.invalid', '(41) 99999-00' || lpad(i::text, 2, '0'),
            nasc,
            case when a < 18 then 'Responsável Demo ' || i end,
            case when a < 18 then '(41) 98888-00' || lpad(i::text, 2, '0') end,
            'aluno', st, true, b, current_date - ((i * 37) % 700));
  end loop;
end $$;
