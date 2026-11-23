import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import Brand from './Brand.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro(''); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setBusy(false);
    if (error) setErro('E-mail ou senha incorretos.');
  };

  return (
    <form className="wrap" onSubmit={entrar}>
      <Brand />
      <label>E-mail
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>Senha
        <input type={ver ? 'text' : 'password'} autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
      </label>
      <div className="row">
        <button type="button" className="btn s sm" onClick={() => setVer(!ver)}>{ver ? 'Ocultar senha' : 'Mostrar senha'}</button>
        <Link className="f" style={{ textAlign: 'right' }} to="/recuperar">Esqueci minha senha</Link>
      </div>
      {erro && <div className="err" role="alert">{erro}</div>}
      <button className="btn" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
      <div className="link">Novo por aqui? <Link to="/cadastro">Solicitar cadastro</Link></div>
    </form>
  );
}
