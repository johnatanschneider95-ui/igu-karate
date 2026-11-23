import { useEffect, useState } from 'react';
import { supabase } from '../../supabase.js';
import { fmtData, diaSemana } from '../../util.js';

export default function Presencas({ aluno }) {
  const [recs, setRecs] = useState(null);
  useEffect(() => {
    supabase.from('attendance_records')
      .select('present,note,attendance_sessions(session_date,classes(name))').eq('student_id', aluno.id)
      .then(({ data }) => setRecs((data || []).filter((r) => r.attendance_sessions)
        .sort((a, b) => b.attendance_sessions.session_date.localeCompare(a.attendance_sessions.session_date))));
  }, [aluno.id]);
  if (!recs) return <p className="m">Carregando presenças…</p>;
  const p = recs.filter((r) => r.present).length;
  const pct = recs.length ? Math.round((p / recs.length) * 100) : null;
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="tag">Presenças</div>
      <div className="grid">
        <div><div className="m">Frequência</div><div className="big">{pct === null ? '—' : `${pct}%`}</div></div>
        <div><div className="m">Presenças</div><div className="big" style={{ color: 'var(--green)' }}>{p}</div></div>
        <div><div className="m">Faltas</div><div className="big" style={{ color: 'var(--red)' }}>{recs.length - p}</div></div>
      </div>
      {recs.length === 0 && <div className="m">Nenhuma chamada registrada ainda.</div>}
      {recs.slice(0, 15).map((r, i) => (
        <div className="row" key={i}>
          <div className="f"><div>{fmtData(r.attendance_sessions.session_date)} · {diaSemana(r.attendance_sessions.session_date)}</div>
            <div className="m">{r.attendance_sessions.classes?.name}{r.note ? ` · ${r.note}` : ''}</div></div>
          <span className="chip" style={{ color: r.present ? 'var(--green)' : 'var(--red)' }}>{r.present ? 'Presente' : 'Falta'}</span>
        </div>
      ))}
      {recs.length > 15 && <div className="m">Mostrando as 15 chamadas mais recentes.</div>}
    </div>
  );
}
