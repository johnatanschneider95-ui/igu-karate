import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { hoje, diaSemana } from '../util.js';
import Avatar from './Avatar.jsx';

const COLS = 'id,full_name,photo_path,belts(name,color_hex)';

export default function Chamada() {
  const { profile } = useAuth();
  const [sp, setSp] = useSearchParams();
  const turma = sp.get('turma') || '';
  const dia = sp.get('data') || hoje();
  const [turmas, setTurmas] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [marks, setMarks] = useState({});
  const [existe, setExiste] = useState(null);
  const [q, setQ] = useState('');
  const [erro, setErro] = useState(''); const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false); const [carregando, setCarregando] = useState(false);
  const setParam = (k, v) => { const n = new URLSearchParams(sp); n.set(k, v); setSp(n, { replace: true }); };

  useEffect(() => {
    // reajusta turmas por idade (quem completou 10 anos passa para a Turma Livre) e carrega a lista
    supabase.rpc('reatribuir_turmas').then(() => supabase.from('classes').select('id,name').eq('active', true).order('kind')
      .then(({ data, error }) => { if (error) setErro('Não foi possível carregar as turmas.'); else setTurmas(data); }));
  }, []);

  useEffect(() => {
    if (!turma || !dia) return;
    let ok = true;
    (async () => {
      setCarregando(true); setErro(''); setMsg('');
      const [ativos, sess] = await Promise.all([
        supabase.from('profiles').select(COLS).eq('role', 'aluno').eq('status', 'aprovado').eq('class_id', turma).order('full_name'),
        supabase.from('attendance_sessions').select('id').eq('class_id', turma).eq('session_date', dia).maybeSingle(),
      ]);
      if (!ok) return;
      if (ativos.error || sess.error) { setErro('Não foi possível carregar a chamada.'); setCarregando(false); return; }
      let lista = ativos.data; const m = {};
      if (sess.data) {
        const { data: recs } = await supabase.from('attendance_records').select('student_id,present,note').eq('session_id', sess.data.id);
        (recs || []).forEach((r) => { m[r.student_id] = { present: r.present, note: r.note || '' }; });
        const falt = (recs || []).map((r) => r.student_id).filter((id) => !lista.some((a) => a.id === id));
        if (falt.length) {
          const { data: extra } = await supabase.from('profiles').select(COLS).in('id', falt);
          lista = [...lista, ...(extra || [])];
        }
      }
      if (!ok) return;
      setExiste(sess.data?.id || null); setAlunos(lista); setMarks(m); setCarregando(false);
    })();
    return () => { ok = false; };
  }, [turma, dia]);

  const marcar = (id, present) => setMarks((m) => ({ ...m, [id]: { note: '', ...m[id], present } }));
  const nota = (id, note) => setMarks((m) => ({ ...m, [id]: { present: null, ...m[id], note } }));
  const todos = () => setMarks((m) => Object.fromEntries(alunos.map((a) => [a.id, { note: '', ...m[a.id], present: true }])));

  const pres = alunos.filter((a) => marks[a.id]?.present === true).length;
  const falt = alunos.filter((a) => marks[a.id]?.present === false).length;
  const vis = alunos.filter((a) => a.full_name.toLowerCase().includes(q.toLowerCase()));

  const confirmar = async () => {
    setErro(''); setMsg('');
    const sem = alunos.length - pres - falt;
    if (!alunos.length) return setErro('Não há alunos ativos para esta chamada.');
    if (sem) return setErro(`Marque presença ou falta de todos os alunos (faltam ${sem}).`);
    setBusy(true);
    let sid = existe;
    if (!sid) {
      const { data: s, error } = await supabase.from('attendance_sessions')
        .insert({ class_id: Number(turma), session_date: dia, teacher_id: profile.id }).select('id').single();
      if (error) {
        setBusy(false);
        return setErro(error.code === '23505' ? 'Já existe uma chamada para esta turma e data. Recarregue a página.' : 'Não foi possível salvar a chamada.');
      }
      sid = s.id;
    }
    const rows = alunos.map((a) => ({ session_id: sid, student_id: a.id, present: marks[a.id].present, note: marks[a.id].note || null }));
    const { error: e2 } = await supabase.from('attendance_records').upsert(rows, { onConflict: 'session_id,student_id' });
    if (e2) { setBusy(false); return setErro('Não foi possível salvar as presenças.'); }
    await supabase.from('audit_log').insert({ actor: profile.id, action: existe ? 'corrigiu_chamada' : 'registrou_chamada', target: String(sid) });
    setExiste(sid); setBusy(false); setMsg('Chamada salva. Os perfis dos alunos já foram atualizados.');
  };

  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Realizar chamada</h2>
      <div className="grid">
        <label>Data<input type="date" max={hoje()} value={dia} onChange={(e) => e.target.value && setParam('data', e.target.value)} /></label>
        <label>Turma<select value={turma} onChange={(e) => setParam('turma', e.target.value)}>
          <option value="">Selecione…</option>{turmas?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      </div>
      {turmas?.length === 0 && <div className="card m">Nenhuma turma ativa. <Link to="/turmas">Crie uma turma</Link> para começar.</div>}
      {!turma && turmas?.length > 0 && <div className="card m">Escolha a turma para carregar os alunos.</div>}
      {turma && <div className="m">{diaSemana(dia)}</div>}
      {existe && <div className="card" style={{ borderColor: 'var(--lav)' }}>Chamada já registrada para esta turma e data. Você está corrigindo.</div>}
      {carregando && <p className="m">Carregando…</p>}
      {turma && !carregando && (
        <>
          <div className="grid">
            <div className="card"><div className="m">Presentes</div><div className="big" style={{ color: 'var(--green)' }}>{pres}</div></div>
            <div className="card"><div className="m">Faltas</div><div className="big" style={{ color: 'var(--red)' }}>{falt}</div></div>
            <button className="btn u" onClick={todos}>Marcar todos presentes</button>
          </div>
          <input type="search" aria-label="Buscar aluno" placeholder="Buscar aluno" value={q} onChange={(e) => setQ(e.target.value)} />
          {vis.map((a) => {
            const m = marks[a.id];
            return (
              <div className="card" key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="row">
                  <Avatar p={a} />
                  <div className="f"><div style={{ fontWeight: 600 }}>{a.full_name}</div>
                    <div className="m">{a.belts ? `Faixa ${a.belts.name.toLowerCase()}` : 'Sem faixa'}</div></div>
                  <button className={`btn sm ${m?.present === true ? 'g' : 's'}`} aria-pressed={m?.present === true} onClick={() => marcar(a.id, true)}>Presente</button>
                  <button className={`btn sm ${m?.present === false ? '' : 's'}`} aria-pressed={m?.present === false} onClick={() => marcar(a.id, false)}>Falta</button>
                </div>
                <input aria-label={`Observação de ${a.full_name}`} placeholder="Observação (opcional)" value={m?.note || ''} onChange={(e) => nota(a.id, e.target.value)} style={{ marginTop: 0 }} />
              </div>
            );
          })}
          {erro && <div className="err" role="alert">{erro}</div>}
          {msg && <div className="ok" role="status">{msg}</div>}
          <button className="btn g" disabled={busy} onClick={confirmar}>{busy ? 'Salvando…' : existe ? 'Salvar correção' : 'Confirmar chamada'}</button>
        </>
      )}
      {!turma && erro && <div className="err" role="alert">{erro}</div>}
    </div>
  );
}
