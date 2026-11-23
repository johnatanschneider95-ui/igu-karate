import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { csv, baixar, fetchAll } from '../csv.js';
import { CAT_CONQUISTA, STATUS, fmtData, idade, hoje } from '../util.js';

const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const pct = (p, t) => (t ? Math.round((p / t) * 100) : null);

function Barras({ itens, sufixo = '' }) {
  const max = Math.max(1, ...itens.map((i) => i.valor ?? 0));
  if (!itens.length) return <div className="m">Sem dados.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {itens.map((i) => (
        <div key={i.rotulo} className="row">
          <div style={{ width: 110, fontSize: 13 }}>{i.rotulo}</div>
          <div className="f"><div className="bar" style={{ width: `${((i.valor ?? 0) / max) * 100}%`, minWidth: i.valor ? 4 : 0, background: i.cor }} /></div>
          <div style={{ width: 48, textAlign: 'right', fontSize: 13 }}>{i.valor === null ? '—' : `${i.valor}${sufixo}`}</div>
        </div>
      ))}
    </div>
  );
}
const Secao = ({ titulo, onCsv, children }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div className="row"><div className="tag f">{titulo}</div>{onCsv && <button className="btn s sm" onClick={onCsv}>Baixar CSV</button>}</div>
    {children}
  </div>
);

export default function RelatoriosGerais() {
  const [ano, setAno] = useState(hoje().slice(0, 4));
  const [raw, setRaw] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!/^\d{4}$/.test(ano)) return;
    let ok = true; setRaw(null); setErro('');
    (async () => {
      try {
        const [al, fr, recs, gr, co] = await Promise.all([
          supabase.from('profiles').select('id,full_name,status,birth_date,belts(name),turma:classes!class_id(name)').eq('role', 'aluno').order('full_name'),
          supabase.from('student_attendance').select('student_id,total,presentes'),
          fetchAll(() => supabase.from('attendance_records').select('student_id,present,attendance_sessions!inner(session_date)').order('session_id').order('student_id')),
          supabase.from('graduations').select('approved_date,teacher_name,profiles!student_id(full_name),de:belts!from_belt_id(name),para:belts!to_belt_id(name)')
            .gte('approved_date', `${ano}-01-01`).lte('approved_date', `${ano}-12-31`).order('approved_date'),
          supabase.from('achievements').select('title,category,achieved_on,profiles!student_id(full_name)')
            .gte('achieved_on', `${ano}-01-01`).lte('achieved_on', `${ano}-12-31`).order('achieved_on'),
        ]);
        if (al.error || fr.error || gr.error || co.error) throw new Error();
        if (ok) setRaw({ alunos: al.data, freq: Object.fromEntries(fr.data.map((r) => [r.student_id, r])), recs, grads: gr.data, conqs: co.data });
      } catch { if (ok) setErro('Não foi possível gerar os relatórios.'); }
    })();
    return () => { ok = false; };
  }, [ano]);

  const d = useMemo(() => {
    if (!raw) return null;
    const { alunos, freq, recs, grads, conqs } = raw;
    const ativos = alunos.filter((a) => a.status === 'aprovado');
    const f = (a) => freq[a.id] || { total: 0, presentes: 0 };
    const porStatus = Object.entries(STATUS).map(([k, v]) => ({ rotulo: v, valor: alunos.filter((a) => a.status === k).length }));
    const faixas = {}; ativos.forEach((a) => { const n = a.belts?.name || 'Sem faixa'; faixas[n] = (faixas[n] || 0) + 1; });
    const porFaixa = Object.entries(faixas).map(([rotulo, valor]) => ({ rotulo, valor }));
    const turmas = {}; ativos.forEach((a) => { const n = a.turma?.name || 'Sem turma'; const t = (turmas[n] ||= { p: 0, t: 0 }); t.p += f(a).presentes; t.t += f(a).total; });
    const porTurma = Object.entries(turmas).map(([rotulo, v]) => ({ rotulo, valor: pct(v.p, v.t), cor: 'var(--green)' }));
    const mensal = MES.map((rotulo, i) => {
      const doMes = recs.filter((r) => r.attendance_sessions.session_date.startsWith(`${ano}-${String(i + 1).padStart(2, '0')}`));
      return { rotulo, valor: pct(doMes.filter((r) => r.present).length, doMes.length), cor: 'var(--lav)' };
    });
    const baixa = ativos.filter((a) => f(a).total > 0 && f(a).presentes / f(a).total < 0.6)
      .sort((a, b) => f(a).presentes / f(a).total - f(b).presentes / f(b).total);
    const porAluno = {}; recs.forEach((r) => { (porAluno[r.student_id] ||= []).push(r); });
    const cuidado = ativos.filter((a) => {
      const l = (porAluno[a.id] || []).sort((x, y) => y.attendance_sessions.session_date.localeCompare(x.attendance_sessions.session_date)).slice(0, 3);
      return l.length === 3 && l.every((r) => !r.present);
    });
    const cats = {}; conqs.forEach((c) => { cats[c.category] = (cats[c.category] || 0) + 1; });
    const porCat = Object.entries(cats).map(([k, valor]) => ({ rotulo: CAT_CONQUISTA[k], valor }));
    return { alunos, ativos, f, porStatus, porFaixa, porTurma, mensal, baixa, cuidado, grads, conqs, porCat };
  }, [raw, ano]);

  const exp = (nome, head, linhas) => baixar(`${nome}.csv`, csv([head, ...linhas]));
  const linhaAluno = (a) => [a.full_name, a.turma?.name || '', a.belts?.name || '', idade(a.birth_date) ?? '', STATUS[a.status]];

  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Relatórios gerais</h2>
      <label>Ano (para frequência mensal, graduações e conquistas)<input type="number" min="2020" max="2100" value={ano} onChange={(e) => setAno(e.target.value)} /></label>
      {erro && <div className="err" role="alert">{erro}</div>}
      {!d && !erro && <p className="m">Gerando…</p>}
      {d && <>
        <Secao titulo="Cuidado com o atleta">
          <div className="m">Este aluno está há algum tempo sem participar dos treinos. Considere entrar em contato para saber se está tudo bem e se precisa de algum apoio. (Alunos com as 3 últimas chamadas sem presença.) Visível só para professores.</div>
          {d.cuidado.length === 0 ? <div>Nenhum aluno neste momento.</div> : d.cuidado.map((a) => <div key={a.id}><Link to={`/alunos/${a.id}`}>{a.full_name}</Link> <span className="m">{a.turma?.name}</span></div>)}
        </Secao>
        <div className="grid">
          <Secao titulo="Alunos por status" onCsv={() => exp('alunos-ativos', ['Nome', 'Turma', 'Faixa', 'Idade', 'Status'], d.ativos.map(linhaAluno))}>
            <Barras itens={d.porStatus} />
            <button className="btn s sm" onClick={() => exp('alunos-inativos', ['Nome', 'Turma', 'Faixa', 'Idade', 'Status'], d.alunos.filter((a) => a.status === 'inativo').map(linhaAluno))}>CSV dos inativos</button>
          </Secao>
          <Secao titulo="Alunos ativos por faixa" onCsv={() => exp('alunos-por-faixa', ['Faixa', 'Alunos'], d.porFaixa.map((i) => [i.rotulo, i.valor]))}>
            <Barras itens={d.porFaixa} />
          </Secao>
        </div>
        <Secao titulo="Frequência por turma" onCsv={() => exp('frequencia-por-turma', ['Turma', 'Frequência (%)'], d.porTurma.map((i) => [i.rotulo, i.valor ?? '']))}>
          <Barras itens={d.porTurma} sufixo="%" />
        </Secao>
        <Secao titulo={`Frequência mensal em ${ano}`} onCsv={() => exp(`frequencia-mensal-${ano}`, ['Mês', 'Frequência (%)'], d.mensal.map((i) => [i.rotulo, i.valor ?? '']))}>
          <Barras itens={d.mensal} sufixo="%" />
        </Secao>
        <Secao titulo="Frequência por aluno" onCsv={() => exp('frequencia-por-aluno', ['Nome', 'Turma', 'Faixa', 'Presenças', 'Faltas', 'Frequência (%)'],
          d.ativos.map((a) => [a.full_name, a.turma?.name || '', a.belts?.name || '', d.f(a).presentes, d.f(a).total - d.f(a).presentes, pct(d.f(a).presentes, d.f(a).total) ?? '']))}>
          <div className="m">{d.ativos.length} alunos ativos. O arquivo traz presenças, faltas e percentual de cada um.</div>
        </Secao>
        <Secao titulo="Alunos com baixa frequência (abaixo de 60%)" onCsv={() => exp('baixa-frequencia', ['Nome', 'Turma', 'Presenças', 'Total de chamadas', 'Frequência (%)'],
          d.baixa.map((a) => [a.full_name, a.turma?.name || '', d.f(a).presentes, d.f(a).total, pct(d.f(a).presentes, d.f(a).total)]))}>
          {d.baixa.length === 0 ? <div>Nenhum aluno abaixo de 60%.</div> : d.baixa.map((a) => (
            <div key={a.id} className="row"><Link className="f" to={`/alunos/${a.id}`}>{a.full_name}</Link><span className="chip">{pct(d.f(a).presentes, d.f(a).total)}%</span></div>))}
        </Secao>
        <Secao titulo={`Graduações em ${ano}`} onCsv={() => exp(`graduacoes-${ano}`, ['Data', 'Aluno', 'Faixa anterior', 'Nova faixa', 'Professor'],
          d.grads.map((g) => [fmtData(g.approved_date), g.profiles?.full_name, g.de?.name || '', g.para?.name, g.teacher_name || '']))}>
          {d.grads.length === 0 ? <div>Nenhuma graduação neste ano.</div> : d.grads.map((g, i) => (
            <div key={i} className="m">{fmtData(g.approved_date)} · {g.profiles?.full_name} → faixa {g.para?.name.toLowerCase()}</div>))}
        </Secao>
        <Secao titulo={`Conquistas e campeonatos em ${ano}`} onCsv={() => exp(`conquistas-${ano}`, ['Data', 'Aluno', 'Conquista', 'Categoria'],
          d.conqs.map((c) => [fmtData(c.achieved_on), c.profiles?.full_name, c.title, CAT_CONQUISTA[c.category]]))}>
          <Barras itens={d.porCat} />
          <div className="m">{d.conqs.length} conquistas registradas no ano.</div>
        </Secao>
      </>}
    </div>
  );
}
