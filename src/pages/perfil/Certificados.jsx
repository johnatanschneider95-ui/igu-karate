import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase.js';
import { useAuth } from '../../auth.jsx';
import { TIPO_CERT, fmtData, hoje } from '../../util.js';

export default function Certificados({ aluno, gerente }) {
  const { profile } = useAuth();
  const [lista, setLista] = useState(null);
  const [novo, setNovo] = useState(false);
  const [f, setF] = useState({ type: 'participacao', title: '', issued_on: hoje(), notes: '' });
  const [erro, setErro] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const carregar = () => supabase.from('certificates').select('*').eq('student_id', aluno.id)
    .order('issued_on', { ascending: false }).then(({ data }) => setLista(data || []));
  useEffect(() => { carregar(); }, [aluno.id]);

  const salvar = async (e) => {
    e.preventDefault(); setErro('');
    const { error } = await supabase.from('certificates').insert({
      student_id: aluno.id, type: f.type, title: f.title.trim(), issued_on: f.issued_on,
      notes: f.notes.trim() || null, teacher_id: profile.id, teacher_name: profile.full_name,
    });
    if (error) return setErro('Não foi possível emitir o certificado.');
    setNovo(false); setF({ type: 'participacao', title: '', issued_on: hoje(), notes: '' }); carregar();
  };
  const excluir = async (c) => {
    if (!confirm(`Excluir o certificado "${c.title}"?`)) return;
    const { error } = await supabase.from('certificates').delete().eq('id', c.id);
    if (error) setErro('Não foi possível excluir.'); else carregar();
  };
  const dica = { participacao: 'Nome do evento', campeonato: 'Nome do campeonato', graduacao: 'Faixa (ex.: laranja)', reconhecimento: 'Motivo do reconhecimento' }[f.type];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="tag">Certificados</div>
      {lista === null && <div className="m">Carregando…</div>}
      {lista?.length === 0 && <div className="m">Nenhum certificado emitido ainda.</div>}
      {lista?.map((c) => (
        <div key={c.id} className="row" style={{ flexWrap: 'wrap' }}>
          <div className="f"><div style={{ fontWeight: 600 }}>{c.title}</div><div className="m">{TIPO_CERT[c.type]} · {fmtData(c.issued_on)}</div></div>
          <Link className="btn u sm" style={{ textAlign: 'center', lineHeight: '20px' }} to={`/certificado/${c.id}`}>Abrir</Link>
          {gerente && <button className="btn s sm" style={{ color: 'var(--red)' }} onClick={() => excluir(c)}>Excluir</button>}
        </div>
      ))}
      {erro && !novo && <div className="err" role="alert">{erro}</div>}
      {gerente && !novo && <button className="btn u" onClick={() => setNovo(true)}>Emitir certificado</button>}
      {gerente && novo && (
        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>Tipo<select value={f.type} onChange={set('type')}>{Object.entries(TIPO_CERT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label>{dica}<input required value={f.title} onChange={set('title')} /></label>
          <label>Data de emissão<input type="date" required value={f.issued_on} onChange={set('issued_on')} /></label>
          <label>Observações (opcional, ex.: colocação)<input value={f.notes} onChange={set('notes')} /></label>
          {erro && <div className="err" role="alert">{erro}</div>}
          <div className="row"><button className="btn g">Emitir</button><button type="button" className="btn s" onClick={() => setNovo(false)}>Cancelar</button></div>
        </form>
      )}
    </div>
  );
}
