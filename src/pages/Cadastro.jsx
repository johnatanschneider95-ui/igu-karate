import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import Brand from './Brand.jsx';

const idade = (d) => {
  const n = new Date(), b = new Date(d);
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
};

export default function Cadastro() {
  const [f, setF] = useState({ nome: '', email: '', senha: '', conf: '', nasc: '', tel: '', resp: '', respTel: '' });
  const [erro, setErro] = useState('');
  const [feito, setFeito] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const menor = f.nasc && idade(f.nasc) < 18;

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    if (f.senha.length < 8) return setErro('A senha precisa ter pelo menos 8 caracteres.');
    if (f.senha !== f.conf) return setErro('As senhas não coincidem.');
    if (menor && (!f.resp.trim() || !f.respTel.trim()))
      return setErro('Informe o nome e o telefone do responsável.');
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: f.email.trim(),
      password: f.senha,
      options: { data: {
        full_name: f.nome.trim(), phone: f.tel.trim(), birth_date: f.nasc,
        guardian_name: menor ? f.resp.trim() : '', guardian_phone: menor ? f.respTel.trim() : '',
      } },
    });
    setBusy(false);
    if (error) {
      return setErro(/registered|already/i.test(error.message)
        ? 'Este e-mail já está cadastrado.' : 'Não foi possível enviar o cadastro. Tente novamente.');
    }
    await supabase.auth.signOut();
    setFeito(true);
  };

  if (feito) return (
    <div className="wrap"><Brand />
      <div className="card"><h2>Cadastro enviado</h2>
        <p className="m">Seu cadastro está aguardando aprovação de um professor ou administrador. Você poderá entrar assim que ele for aprovado.</p>
        <p className="m">Turma: {idade(f.nasc) < 10 ? 'Kids' : 'Turma Livre'}.</p></div>
      <Link className="btn u" style={{ textAlign: 'center' }} to="/login">Voltar ao login</Link>
    </div>
  );

  return (
    <form className="wrap" onSubmit={enviar}>
      <h2>Solicitar cadastro</h2>
      <label>Nome completo<input required value={f.nome} onChange={set('nome')} autoComplete="name" /></label>
      <label>E-mail<input type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></label>
      <label>Data de nascimento<input type="date" required value={f.nasc} onChange={set('nasc')} max={new Date().toISOString().slice(0, 10)} /></label>
      <label>Telefone<input type="tel" value={f.tel} onChange={set('tel')} autoComplete="tel" /></label>
      {menor && <>
        <label>Nome do responsável<input required value={f.resp} onChange={set('resp')} /></label>
        <label>Telefone do responsável<input type="tel" required value={f.respTel} onChange={set('respTel')} /></label>
      </>}
      <label>Senha (mínimo 8 caracteres)<input type="password" required value={f.senha} onChange={set('senha')} autoComplete="new-password" /></label>
      <label>Confirmar senha<input type="password" required value={f.conf} onChange={set('conf')} autoComplete="new-password" /></label>
      {erro && <div className="err" role="alert">{erro}</div>}
      <button className="btn g" disabled={busy}>{busy ? 'Enviando…' : 'Enviar cadastro'}</button>
      <div className="link"><Link to="/login">Já tenho conta</Link></div>
    </form>
  );
}
