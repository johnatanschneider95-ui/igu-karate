# IGU Karatê

Aplicativo de gestão do **Instituto Gerando Unidade** (projeto social de karatê): alunos, turmas, chamada, graduações, cronogramas, evolução, avisos, calendário, conquistas, certificados e carteirinha.

**Disciplina. Respeito. Evolução.**

## Tecnologias
React 18 + Vite, React Router e Supabase (login, banco Postgres com RLS e armazenamento de imagens).

## Funcionalidades
- Login, cadastro com aprovação, recuperação e troca de senha; perfis de administrador, professor e aluno
- Turmas automáticas por idade (Kids abaixo de 10 anos, Turma Livre a partir de 10) e faixas em duas trilhas (infantil e regular)
- Chamada com correção, histórico e relatórios de presença do mês e do ano (CSV e PDF)
- Graduações, cronogramas por faixa (apostila Goju-Ryu), validação de itens e evolução do aluno
- Avisos, calendário e eventos com confirmação de presença
- Conquistas, certificados em PDF e carteirinha do atleta
- Relatórios gerais com gráficos e painel privado "Cuidado com o atleta"
- Apostila com a história e o cronograma

## Como rodar
1. Crie um projeto no [Supabase](https://supabase.com) e rode os arquivos de `supabase/` na ordem indicada em `supabase/LEIAME.md`.
2. Crie o administrador inicial (uma única vez, na sua máquina):
   ```
   npm install
   SUPABASE_URL=... SERVICE_ROLE_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/criar_admin.mjs
   ```
   No Windows (PowerShell) use `$env:SUPABASE_URL="..."` e assim por diante. A senha inicial deve ser trocada no primeiro acesso.
3. Copie `.env.example` para `.env` e preencha a URL do projeto e a chave **anon/publishable**.
4. `npm run dev` e abra o endereço mostrado no terminal.

## Segurança
- **Nunca** envie para o GitHub o arquivo `.env` nem a chave `service_role` (já estão fora do versionamento pelo `.gitignore`).
- A chave anon/publishable pode ficar no app: a proteção dos dados está nas regras de acesso (RLS) do banco.
- O projeto trata dados de crianças e adolescentes: mantenha o repositório **privado**.

## Publicação
Qualquer hospedagem de site estático (Vercel, Netlify, Cloudflare Pages): comando `npm run build`, pasta `dist`, variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Depois coloque o endereço público em **Authentication > URL Configuration > Site URL** no Supabase.
