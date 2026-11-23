import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { fmtData, diaSemana } from '../util.js';

export default function Historico() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  useEffect(() => {
    supabase.from('attendance_sessions')
      .select('id,session_date,class_id,classes(name),attendance_records(present)')
      .order('session_date', { ascending: false }).limit(100)
      .then(({ data, error }) => { if (error) setErro('Não foi possível carregar o histórico.'); else setLista(data); });
  }, []);
  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Histórico de chamadas</h2>
      {erro && <div className="err" role="alert">{erro}</div>}
      {lista === null && !erro && <p className="m">Carregando…</p>}
      {lista?.length === 0 && <div className="card m">Nenhuma chamada registrada ainda.</div>}
      {lista?.map((s) => {
        const p = s.attendance_records.filter((r) => r.present).length;
        return (
          <Link key={s.id} className="card row" style={{ color: '#fff' }} to={`/chamada?turma=${s.class_id}&data=${s.session_date}`}>
            <div className="f"><div style={{ fontWeight: 600 }}>{fmtData(s.session_date)} · {diaSemana(s.session_date)}</div>
              <div className="m">{s.classes?.name}</div></div>
            <span className="chip" style={{ color: 'var(--green)' }}>{p} presentes</span>
            <span className="chip" style={{ color: 'var(--red)' }}>{s.attendance_records.length - p} faltas</span>
          </Link>
        );
      })}
    </div>
  );
}
