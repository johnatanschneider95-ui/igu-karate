// Cria o administrador inicial. Roda UMA vez, na sua máquina. Nunca no frontend.
// Uso: SUPABASE_URL=... SERVICE_ROLE_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/criar_admin.mjs
import { createClient } from '@supabase/supabase-js';
const { SUPABASE_URL, SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Faltam variáveis de ambiente.'); process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await sb.auth.admin.createUser({
  email: ADMIN_EMAIL, password: ADMIN_PASSWORD, email_confirm: true,
  user_metadata: { full_name: 'Administrador IGU' },
});
if (error) { console.error(error.message); process.exit(1); }
const { error: e2 } = await sb.from('profiles')
  .update({ role: 'admin', status: 'aprovado', must_change_password: true })
  .eq('id', data.user.id);
if (e2) { console.error(e2.message); process.exit(1); }
console.log('Admin criado. A troca de senha será exigida no primeiro acesso.');
