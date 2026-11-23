import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { DIAS } from '../util.js';

const REGRA = { kids: 'Alunos com menos de 10 anos entram automaticamente.', livre: 'Alunos com 10 anos ou mais entram automaticamente.' };

export default function Turmas() {
  const [lista, setLista] = useState(null);
  const [ed, setEd] = useState({});
  const [erro, setErro] = useState(''); const [msg, setMsg] = useState('');

  const carregar = async () => {
    const { data, error } = await supabase.from('classes').select('*').order('kind').order('name');
    if (error) return setErro('Não foi possível carregar as turmas.');
    setLista(data);
    setEd(Object.fromEntries(data.map((t) => [t.id, { dias: t.weekdays, hora: (t.start_time || '').slice(0, 5) }])));
  };
  useEffect(() => { carregar(); }, []);

  const toggle = (id, d) => setEd((e) => {
    const dias = e[id].dias.includes(d) ? e[id].dias.filter((x) => x !== d) : [...e[id].dias, d].sort();
    return { ...e, [id]: { ...e[id], dias } };
  });
  const aviso = (ok, texto) => { setErro(ok ? '' : texto); setMsg(ok ? texto : ''); };

  const salvar = async (t) => {
    const { error } = await supabase.from('classes').update({ weekdays: ed[t.id].dias, start_time: ed[t.id].hora || null }).eq('id', t.id);
    aviso(!error, error ? 'Não foi possível salvar.' : `${t.name}: dias e horário salvos.`); if (!error) carregar();
  };
  const alternar = async (t) => {
    const { error } = await supabase.from('classes').update({ active: !t.active }).eq('id', t.id);
    aviso(!error, error ? 'Não foi possível alterar a turma.' : `${t.name} ${t.active ? 'desativada' : 'reativada'}.`); if (!error) carregar();
  };
  const excluir = async (t) => {
    const extra = t.kind ? ' Os alunos dessa faixa de idade ficarão sem turma até você recriar as turmas padrão.' : '';
    if (!confirm(`Excluir a turma "${t.name}"?${extra}`)) return;
    const { error } = await supabase.rpc('excluir_turma', { p_id: t.id });
    if (error) return aviso(false, /turma_com_chamadas/.test(error.message)
      ? 'Esta turma tem chamadas registradas e não pode ser excluída, para não perder o histórico. Use Desativar.'
      : 'Não foi possível excluir a turma.');
    aviso(true, 'Turma excluída.'); carregar();
  };
  const recriar = async () => {
    const { error } = await supabase.rpc('criar_turmas_padrao');
    aviso(!error, error ? 'Não foi possível recriar as turmas.' : 'Turmas padrão recriadas e alunos reorganizados.'); if (!error) carregar();
  };
  const faltam = lista && ['kids', 'livre'].some((k) => !lista.some((t) => t.kind === k));

  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Turmas</h2>
      <div className="m">O aluno entra na turma certa automaticamente, pela idade, assim que se cadastra.</div>
      {erro && <div className="err" role="alert">{erro}</div>}
      {msg && <div className="ok" role="status">{msg}</div>}
      {faltam && <div className="card" style={{ borderColor: 'var(--lav)' }}>
        <p className="m">Falta uma das turmas padrão (Kids ou Turma Livre).</p>
        <button className="btn u" onClick={recriar}>Recriar turmas padrão</button></div>}
      {lista === null && !erro && <p className="m">Carregando…</p>}
      {lista?.map((t) => (
        <div className="card" key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: t.active ? 1 : 0.7 }}>
          <div><div style={{ fontWeight: 800, fontSize: 18 }}>{t.name} {!t.active && <span className="tag">desativada</span>}</div><div className="m">{REGRA[t.kind]}</div></div>
          <div className="m">Dias de treino</div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {DIAS.map((d, i) => (
              <button type="button" key={d} aria-pressed={ed[t.id]?.dias.includes(i)} className={`btn sm ${ed[t.id]?.dias.includes(i) ? 'u' : 's'}`} onClick={() => toggle(t.id, i)}>{d.slice(0, 3)}</button>
            ))}
          </div>
          <label>Horário<input type="time" value={ed[t.id]?.hora || ''} onChange={(e) => setEd({ ...ed, [t.id]: { ...ed[t.id], hora: e.target.value } })} /></label>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn g f" onClick={() => salvar(t)}>Salvar</button>
            <button className="btn s f" onClick={() => alternar(t)}>{t.active ? 'Desativar' : 'Reativar'}</button>
            <button className="btn s f" style={{ color: 'var(--red)' }} onClick={() => excluir(t)}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
