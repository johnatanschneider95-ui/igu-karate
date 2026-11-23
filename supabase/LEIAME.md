# Banco de dados (Supabase)

Rode no **SQL Editor** do Supabase, **nesta ordem**. Os arquivos marcados como *demo* são opcionais e servem só para testar.

| Ordem | Arquivo | O que faz |
|---|---|---|
| 1 | `01_schema.sql` | Perfis, faixas (infantil e regular), cronogramas, regras de segurança (RLS) |
| 2 | `03_fase2.sql` | Faixa e data de entrada nos perfis, fotos, trava de campos administrativos |
| 3 | `04_alunos_demo.sql` | *demo*: 35 alunos fictícios (sem login) |
| 4 | `05_fase3.sql` | Chamadas, presenças, graduações, evolução |
| 5 | `07_turmas_auto.sql` | Turmas Kids e Turma Livre, com entrada automática por idade |
| 6 | `08_presencas_demo_v2.sql` | *demo*: 12 semanas de chamadas fictícias |
| 7 | `09_fase4.sql` | Avisos, calendário, eventos, excluir turma |
| 8 | `10_avisos_eventos_demo.sql` | *demo*: avisos e eventos de exemplo |
| 9 | `11_fase5.sql` | Conquistas, certificados e base para responsáveis |
| 10 | `12_demo_fase5.sql` | *demo*: conquistas de exemplo |
| 11 | `13_cronogramas.sql` | Cronogramas por faixa extraídos da apostila (apaga o cronograma atual e recria) |

Remover os dados de demonstração: veja o comentário no topo de cada arquivo *demo*.
