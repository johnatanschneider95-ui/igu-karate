import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { idade, STATUS, COR_STATUS, fmtData } from '../util.js';
import Avatar from './Avatar.jsx';
import Presencas from './perfil/Presencas.jsx';
import CronogramaAluno from './perfil/CronogramaAluno.jsx';
import Graduacoes from './perfil/Graduacoes.jsx';
import Evolucao from './perfil/Evolucao.jsx';
import Conquistas from './perfil/Conquistas.jsx';
import Certificados from './perfil/Certificados.jsx';

export default function Perfil() {
  const { id } = useParams();
  const { profile, isStaff } = useAuth();
  const alvo = id || profile.id;
  const gerente = isStaff && !!id;
  const [p, setP] = useState(null);
  const [erro, setErro] = useState('');
  const [edit, setEdit] = useState(null);

  const carregar = async () => {
    const { data, error } = await supabase.from('profiles').select('*, belts(name,color_hex,track), turma:classes!class_id(name)').eq('id', alvo).single();
    if (error) setErro('Perfil não encontrado.'); else setP(data);
  };
  useEffect(() => { carregar(); }, [alvo]);

  const log = (action) => supabase.from('audit_log').insert({ actor: profile.id, action, target: alvo });

  const mudarStatus = async (status) => {
    setErro('');
    const { error } = await supabase.from('profiles').update({ status }).eq('id', alvo);
    if (error) return setErro('Não foi possível alterar o status.');
    await log(status === 'inativo' ? 'desativou_aluno' : 'reativou_aluno');
    carregar();
  };

  const salvar = async (e) => {
    e.preventDefault(); setErro('');
    const { error } = await supabase.from('profiles').update({
      full_name: edit.full_name.trim(), phone: edit.phone || null, birth_date: edit.birth_date || null,
      guardian_name: edit.guardian_name || null, guardian_phone: edit.guardian_phone || null,
    }).eq('id', alvo);
    if (error) return setErro('Não foi possível salvar. Menores de 18 anos precisam de responsável.');
    await log('editou_aluno'); setEdit(null); carregar();
  };
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value });

  if (erro && !p) return <div className="wrap"><div className="err">{erro}</div><Link to="/">Voltar</Link></div>;
  if (!p) return <p className="center">Carregando…</p>;
  const i = idade(p.birth_date);

  return (
    <div className="wrap wide">
      <Link to={gerente ? '/alunos' : '/'}>← Voltar</Link>
      <div className="row">
        <Avatar p={p} size={72} />
        <div className="f">
          <h2>{p.full_name} {p.is_demo && <span className="tag">demo</span>}</h2>
          <div className="row" style={{ marginTop: 6, flexWrap: 'wrap' }}>
            {p.belts && <span className="chip"><span className="dot" style={{ background: p.belts.color_hex }} />Faixa {p.belts.name.toLowerCase()}</span>}
            <span className="chip" style={{ color: COR_STATUS[p.status] }}>{STATUS[p.status]}</span>
          </div>
        </div>
      </div>
      {erro && <div className="err" role="alert">{erro}</div>}
      <div className="grid">
        <div className="card"><div className="m">Idade</div><div className="big">{i ?? '—'}</div></div>
        <div className="card"><div className="m">Entrada</div><div className="big" style={{ fontSize: 20 }}>{fmtData(p.joined_at)}</div></div>
        <div className="card"><div className="m">Turma</div><div className="big" style={{ fontSize: 20 }}>{p.turma?.name || '—'}</div></div>
        <div className="card"><div className="m">Trilha de faixas</div><div className="big" style={{ fontSize: 20 }}>{p.belts ? (p.belts.track === 'infantil' ? 'Infantil' : 'Regular') : '—'}</div></div>
      </div>
      {!edit && (
        <div className="card">
          <div className="tag">Dados pessoais</div>
          <p className="m">E-mail: {p.email}<br />Telefone: {p.phone || '—'}<br />Nascimento: {fmtData(p.birth_date)}</p>
          {p.guardian_name && <p className="m">Responsável: {p.guardian_name} · {p.guardian_phone}</p>}
        </div>
      )}
      {edit && (
        <form className="card" onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>Nome<input required value={edit.full_name} onChange={set('full_name')} /></label>
          <label>Telefone<input value={edit.phone || ''} onChange={set('phone')} /></label>
          <label>Nascimento<input type="date" value={edit.birth_date || ''} onChange={set('birth_date')} /></label>
          <label>Nome do responsável<input value={edit.guardian_name || ''} onChange={set('guardian_name')} /></label>
          <label>Telefone do responsável<input value={edit.guardian_phone || ''} onChange={set('guardian_phone')} /></label>
          <div className="row"><button className="btn g">Salvar</button><button type="button" className="btn s" onClick={() => setEdit(null)}>Cancelar</button></div>
        </form>
      )}
      {p.status !== 'pendente' && p.role === 'aluno' && <>
        <Presencas aluno={p} />
        {p.belt_id && <CronogramaAluno key={p.belt_id} aluno={p} editavel={gerente} />}
        <Graduacoes aluno={p} gerente={gerente} onChange={carregar} />
        <Evolucao aluno={p} gerente={gerente} />
        <Conquistas aluno={p} gerente={gerente} />
        <Certificados aluno={p} gerente={gerente} />
      </>}
      {gerente && !edit && (
        <div className="row">
          <button className="btn u" onClick={() => setEdit(p)}>Editar</button>
          {p.status === 'aprovado' && <button className="btn s" onClick={() => mudarStatus('inativo')}>Desativar aluno</button>}
          {p.status === 'inativo' && <button className="btn g" onClick={() => mudarStatus('aprovado')}>Reativar aluno</button>}
        </div>
      )}
      {p.role === 'aluno' && p.status === 'aprovado' && <Link to={gerente ? `/carteirinha/${p.id}` : '/carteirinha'} className="btn s" style={{ textAlign: 'center' }}>Ver carteirinha</Link>}
      {!gerente && <Link to="/configuracoes" className="btn s" style={{ textAlign: 'center' }}>Editar meus dados</Link>}
    </div>
  );
}
