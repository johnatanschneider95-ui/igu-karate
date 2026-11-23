import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import Brand from './Brand.jsx';

export default function Recuperar() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const enviar = async (e) => {
    e.preventDefault(); setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/trocar-senha` });
    setBusy(false);
    // mesma resposta exista ou não o e-mail (não revela quem tem conta)
    setMsg('Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha.');
  };
  return (
    <form className="wrap" onSubmit={enviar}>
      <Brand />
      <h2>Recuperar senha</h2>
      <label>E-mail<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {msg && <div className="ok" role="status">{msg}</div>}
      <button className="btn" disabled={busy}>Enviar link</button>
      <div className="link"><Link to="/login">Voltar ao login</Link></div>
    </form>
  );
}
