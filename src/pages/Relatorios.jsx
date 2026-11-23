import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { hoje } from '../util.js';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const dm = (d) => `${d.slice(8)}/${d.slice(5, 7)}`;

async function fetchAll(make) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await make().range(from, from + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}
const csv = (rows) => '\ufeff' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
const baixar = (nome, texto) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
  a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

export default function Relatorios() {
  const [turmas, setTurmas] = useState([]);
  const [turma, setTurma] = useState('');
  const [tipo, setTipo] = useState('mes');
  const [mes, setMes] = useState(hoje().slice(0, 7));
  const [ano, setAno] = useState(hoje().slice(0, 4));
  const [tab, setTab] = useState(null);
  const [erro, setErro] = useState(''); const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.from('classes').select('id,name,weekdays').eq('active', true).order('kind')
      .then(({ data }) => { setTurmas(data || []); if (data?.[0]) setTurma(String(data[0].id)); });
  }, []);

  useEffect(() => {
    if (!turma || (tipo === 'ano' ? !/^\d{4}$/.test(ano) : !mes)) return;
    let ok = true;
    (async () => {
      setErro(''); setCarregando(true);
      try {
        const cls = turmas.find((t) => String(t.id) === turma);
        const [y, mo] = (tipo === 'ano' ? `${ano}-01` : mes).split('-').map(Number);
        const ini = tipo === 'ano' ? `${ano}-01-01` : `${mes}-01`;
        const fim = tipo === 'ano' ? `${ano}-12-31` : `${mes}-${String(new Date(y, mo, 0).getDate()).padStart(2, '0')}`;
        const mem = await supabase.from('profiles').select('id,full_name').eq('role', 'aluno').eq('status', 'aprovado').eq('class_id', turma).order('full_name');
        if (mem.error) throw mem.error;
        let alunos = mem.data; let recs = [];
        if (tipo !== 'branco') {
          recs = await fetchAll(() => supabase.from('attendance_records')
            .select('student_id,present,attendance_sessions!inner(session_date,class_id)')
            .eq('attendance_sessions.class_id', turma)
            .gte('attendance_sessions.session_date', ini).lte('attendance_sessions.session_date', fim)
            .order('session_id').order('student_id'));
          const extra = [...new Set(recs.map((r) => r.student_id))].filter((id) => !alunos.some((a) => a.id === id));
          if (extra.length) {
            const { data } = await supabase.from('profiles').select('id,full_name').in('id', extra);
            alunos = [...alunos, ...(data || [])].sort((a, b) => a.full_name.localeCompare(b.full_name, 'pt-BR'));
          }
        }
        let cols = [], rows = [];
        const periodo = tipo === 'ano' ? ano : `${MESES[mo - 1]}/${y}`;
        if (tipo === 'mes') {
          cols = [...new Set(recs.map((r) => r.attendance_sessions.session_date))].sort();
          const m = new Map(recs.map((r) => [`${r.student_id}|${r.attendance_sessions.session_date}`, r.present]));
          rows = alunos.map((a) => {
            const cells = cols.map((d) => { const v = m.get(`${a.id}|${d}`); return v === undefined ? '-' : v ? 'P' : 'F'; });
            const p = cells.filter((c) => c === 'P').length, f = cells.filter((c) => c === 'F').length;
            return { nome: a.full_name, cells, p, f, pct: p + f ? Math.round((p / (p + f)) * 100) : null };
          });
          cols = cols.map(dm);
        } else if (tipo === 'ano') {
          cols = MESES.map((n) => n.slice(0, 3));
          rows = alunos.map((a) => {
            const meus = recs.filter((r) => r.student_id === a.id);
            const cells = MESES.map((_, i) => {
              const doMes = meus.filter((r) => Number(r.attendance_sessions.session_date.slice(5, 7)) === i + 1);
              return doMes.length ? `${doMes.filter((r) => r.present).length}/${doMes.length}` : '-';
            });
            const p = meus.filter((r) => r.present).length;
            return { nome: a.full_name, cells, p, f: meus.length - p, pct: meus.length ? Math.round((p / meus.length) * 100) : null };
          });
        } else {
          const total = new Date(y, mo, 0).getDate();
          for (let d = 1; d <= total; d++)
            if (cls.weekdays.includes(new Date(y, mo - 1, d).getDay())) cols.push(`${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}`);
          rows = alunos.map((a) => ({ nome: a.full_name, cells: cols.map(() => '') }));
        }
        if (ok) setTab({ cols, rows, tipo, periodo, turma: cls?.name || '', semDias: tipo === 'branco' && cols.length === 0 });
      } catch { if (ok) { setErro('Não foi possível gerar o relatório.'); setTab(null); } }
      if (ok) setCarregando(false);
    })();
    return () => { ok = false; };
  }, [turma, tipo, mes, ano, turmas]);

  const titulo = tab && `${tab.tipo === 'branco' ? 'Formulário de presença' : 'Lista de presença'} · ${tab.turma} · ${tab.periodo}`;

  const exportar = () => {
    const stats = tab.tipo !== 'branco';
    const head = stats ? ['Nome', ...tab.cols, 'Presenças', 'Faltas', 'Frequência'] : ['Nº', 'Nome', ...tab.cols];
    const corpo = tab.rows.map((r, i) => stats ? [r.nome, ...r.cells, r.p, r.f, r.pct === null ? '' : `${r.pct}%`] : [i + 1, r.nome, ...r.cells]);
    const nome = `${tab.tipo === 'branco' ? 'formulario' : 'presenca'}-${tab.turma}-${tab.periodo}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    baixar(`${nome}.csv`, csv([[titulo], [], head, ...corpo]));
  };

  return (
    <div className="wrap wide">
      <Link className="no-print" to="/">← Início</Link>
      <h2 className="no-print">Relatórios de presença</h2>
      <div className="grid no-print">
        <label>Turma<select value={turma} onChange={(e) => setTurma(e.target.value)}>{turmas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label>Tipo<select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="mes">Lista do mês (com presenças)</option><option value="ano">Lista do ano (resumo por mês)</option><option value="branco">Formulário do mês em branco</option></select></label>
        {tipo === 'ano'
          ? <label>Ano<input type="number" min="2020" max="2100" value={ano} onChange={(e) => setAno(e.target.value)} /></label>
          : <label>Mês<input type="month" value={mes} onChange={(e) => e.target.value && setMes(e.target.value)} /></label>}
      </div>
      {erro && <div className="err" role="alert">{erro}</div>}
      {carregando && <p className="m">Gerando…</p>}
      {tab && !carregando && (
        <>
          <div className="row no-print">
            <button className="btn g" onClick={exportar}>Baixar CSV (Excel)</button>
            <button className="btn u" onClick={() => window.print()}>Imprimir ou salvar em PDF</button>
          </div>
          <div><div style={{ fontWeight: 800, fontSize: 18 }}>IGU Karatê · Instituto Gerando Unidade</div><div className="m">{titulo}</div></div>
          {tab.semDias && <div className="card m no-print">Esta turma não tem dias de treino definidos. Defina em <Link to="/turmas">Turmas</Link>.</div>}
          {tab.rows.length === 0 && <div className="card m">Nenhum aluno nesta turma.</div>}
          {tab.rows.length > 0 && !tab.semDias && (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr>
                  <th>{tab.tipo === 'branco' ? 'Nº' : ''}</th><th className="nm">Nome</th>
                  {tab.cols.map((c) => <th key={c}>{c}</th>)}
                  {tab.tipo !== 'branco' && <><th>Pres.</th><th>Faltas</th><th>Freq.</th></>}
                </tr></thead>
                <tbody>{tab.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td><td className="nm">{r.nome}</td>
                    {r.cells.map((c, j) => <td key={j} className={c === 'P' ? 'pf' : c === 'F' ? 'ff' : ''} style={tab.tipo === 'branco' ? { minWidth: 34, height: 28 } : undefined}>{c}</td>)}
                    {tab.tipo !== 'branco' && <><td>{r.p}</td><td>{r.f}</td><td>{r.pct === null ? '—' : `${r.pct}%`}</td></>}
                  </tr>))}
                </tbody>
              </table>
            </div>
          )}
          <div className="only-print" style={{ marginTop: 28 }}>Professor responsável: ______________________________  Assinatura: ______________________________</div>
        </>
      )}
    </div>
  );
}
