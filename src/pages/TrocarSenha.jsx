import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';

export default function TrocarSenha() {
  const { profile, refresh } = useAuth();
  const nav = useNavigate();
  const [s, setS] = useState(''); const [c, setC] = useState('');
  const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false);

  const salvar = async (e) => {
    e.preventDefault(); setErro('');
    if (s.length < 8) return setErro('A senha precisa ter pelo menos 8 caracteres.');
    if (s !== c) return setErro('As senhas não coincidem.');
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: s });
    if (error) { setBusy(false); return setErro('Não foi possível trocar a senha. Tente outra.'); }
    await supabase.from('profiles').update({ must_change_password: false }).eq('id', profile.id);
    await refresh(); setBusy(false); nav('/', { replace: true });
  };

  return (
    <form className="wrap" onSubmit={salvar}>
      <h2>{profile?.must_change_password ? 'Crie sua senha definitiva' : 'Nova senha'}</h2>
      {profile?.must_change_password && <p className="m">Por segurança, troque a senha inicial antes de continuar.</p>}
      <label>Nova senha<input type="password" required value={s} onChange={(e) => setS(e.target.value)} autoComplete="new-password" /></label>
      <label>Confirmar nova senha<input type="password" required value={c} onChange={(e) => setC(e.target.value)} autoComplete="new-password" /></label>
      {erro && <div className="err" role="alert">{erro}</div>}
      <button className="btn g" disabled={busy}>Salvar senha</button>
    </form>
  );
}
