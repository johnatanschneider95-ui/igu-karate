import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { idade, STATUS, COR_STATUS, fmtData } from '../util.js';
import Avatar from './Avatar.jsx';

export default function Alunos() {
  const [alunos, setAlunos] = useState(null);
  const [belts, setBelts] = useState([]);
  const [erro, setErro] = useState('');
  const [q, setQ] = useState('');
  const [faixa, setFaixa] = useState('');
  const [status, setStatus] = useState('');
  const [ida, setIda] = useState('');
  const [ord, setOrd] = useState('nome');
  const [freq, setFreq] = useState({});
  const [fq, setFq] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*, belts(name,color_hex,track)').eq('role', 'aluno'),
      supabase.from('belts').select('name,position,track').order('position'),
      supabase.from('student_attendance').select('student_id,total,presentes'),
    ]).then(([a, b, c]) => {
      if (a.error) return setErro('Não foi possível carregar os alunos.');
      setAlunos(a.data); setBelts(b.data || []);
      setFreq(Object.fromEntries((c.data || []).map((r) => [r.student_id, r])));
    });
  }, []);

  const nomesFaixa = useMemo(() => [...new Set(belts.map((b) => b.name))], [belts]);

  const vis = useMemo(() => {
    if (!alunos) return [];
    const r = alunos.filter((a) => {
      const i = idade(a.birth_date);
      if (q && !a.full_name.toLowerCase().includes(q.toLowerCase())) return false;
      if (faixa && a.belts?.name !== faixa) return false;
      if (status && a.status !== status) return false;
      if (fq === 'baixa') { const f = freq[a.id]; if (!(f && f.total > 0 && f.presentes / f.total < 0.6)) return false; }
      if (ida === 'kid' && !(i !== null && i < 10)) return false;
      if (ida === 'teen' && !(i !== null && i >= 10 && i < 18)) return false;
      if (ida === 'adulto' && !(i !== null && i >= 18)) return false;
      return true;
    });
    const cmp = {
      nome: (a, b) => a.full_name.localeCompare(b.full_name, 'pt-BR'),
      entrada: (a, b) => (b.joined_at || '').localeCompare(a.joined_at || ''),
      idade: (a, b) => (idade(a.birth_date) ?? 0) - (idade(b.birth_date) ?? 0),
    }[ord];
    return r.sort(cmp);
  }, [alunos, q, faixa, status, ida, ord, fq, freq]);

  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Alunos</h2>
      <input type="search" placeholder="Buscar aluno pelo nome" aria-label="Buscar aluno" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid">
        <label>Faixa<select value={faixa} onChange={(e) => setFaixa(e.target.value)}>
          <option value="">Todas</option>{nomesFaixa.map((n) => <option key={n}>{n}</option>)}</select></label>
        <label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Idade<select value={ida} onChange={(e) => setIda(e.target.value)}>
          <option value="">Todas</option><option value="kid">Até 9 anos</option><option value="teen">10 a 17 anos</option><option value="adulto">18 anos ou mais</option></select></label>
        <label>Frequência<select value={fq} onChange={(e) => setFq(e.target.value)}>
          <option value="">Todas</option><option value="baixa">Abaixo de 60%</option></select></label>
        <label>Ordenar por<select value={ord} onChange={(e) => setOrd(e.target.value)}>
          <option value="nome">Nome</option><option value="entrada">Entrada mais recente</option><option value="idade">Idade</option></select></label>
      </div>
      {erro && <div className="err" role="alert">{erro}</div>}
      {alunos === null && !erro && <p className="m">Carregando…</p>}
      {alunos && <div className="m">{vis.length} de {alunos.length} alunos</div>}
      {alunos && vis.length === 0 && <div className="card m">Nenhum aluno encontrado com esses filtros.</div>}
      {vis.map((a) => (
        <Link key={a.id} to={`/alunos/${a.id}`} className="card row" style={{ color: '#fff' }}>
          <Avatar p={a} />
          <div className="f">
            <div style={{ fontWeight: 600 }}>{a.full_name} {a.is_demo && <span className="tag">demo</span>}</div>
            <div className="m">{idade(a.birth_date) ?? '—'} anos · entrou em {fmtData(a.joined_at)}{freq[a.id]?.total ? ` · frequência ${Math.round((freq[a.id].presentes / freq[a.id].total) * 100)}%` : ''}</div>
          </div>
          {a.belts && <span className="chip"><span className="dot" style={{ background: a.belts.color_hex }} />{a.belts.name}</span>}
          <span className="chip" style={{ color: COR_STATUS[a.status] }}>{STATUS[a.status]}</span>
        </Link>
      ))}
    </div>
  );
}
