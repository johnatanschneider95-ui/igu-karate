import { useEffect, useState } from 'react';
import { supabase } from '../../supabase.js';
import { fmtData, hoje, trilha } from '../../util.js';

export default function Graduacoes({ aluno, gerente, onChange }) {
  const [lista, setLista] = useState(null);
  const [belts, setBelts] = useState([]);
  const [novo, setNovo] = useState(false);
  const [f, setF] = useState({ to: '', exame: '', aprov: hoje(), obs: '' });
  const [erro, setErro] = useState('');

  useEffect(() => {
    supabase.from('graduations')
      .select('*, de:belts!from_belt_id(name,color_hex), para:belts!to_belt_id(name,color_hex)')
      .eq('student_id', aluno.id).order('approved_date', { ascending: false }).order('id', { ascending: false })
      .then(({ data }) => setLista(data || []));
    if (gerente) {
      const tr = aluno.belts?.track || trilha(aluno.birth_date);
      supabase.from('belts').select('id,name,position').eq('track', tr).order('position').then(({ data }) => setBelts(data || []));
    }
  }, [aluno.id, aluno.belt_id, gerente]);

  const registrar = async (e) => {
    e.preventDefault(); setErro('');
    const { error } = await supabase.rpc('registrar_graduacao', {
      p_student: aluno.id, p_to_belt: Number(f.to), p_exam: f.exame || null, p_approved: f.aprov, p_notes: f.obs || null,
    });
    if (error) return setErro('Não foi possível registrar a graduação.');
    setNovo(false); setF({ to: '', exame: '', aprov: hoje(), obs: '' }); onChange();
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="tag">Graduações</div>
      {lista === null && <div className="m">Carregando…</div>}
      {lista?.length === 0 && <div className="m">Nenhuma graduação registrada ainda.</div>}
      {lista?.map((g) => (
        <div key={g.id} className="row">
          <span className="dot" style={{ background: g.para?.color_hex, width: 14, height: 14 }} />
          <div className="f"><div style={{ fontWeight: 600 }}>Faixa {g.para?.name.toLowerCase()}</div>
            <div className="m">{fmtData(g.approved_date)}{g.de ? ` · de ${g.de.name.toLowerCase()}` : ''}{g.teacher_name ? ` · ${g.teacher_name}` : ''}{g.notes ? ` · ${g.notes}` : ''}</div></div>
        </div>
      ))}
      {gerente && !novo && <button className="btn u" onClick={() => setNovo(true)}>Registrar graduação</button>}
      {gerente && novo && (
        <form onSubmit={registrar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>Nova faixa<select required value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })}>
            <option value="">Selecione…</option>
            {belts.filter((b) => b.id !== aluno.belt_id).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <label>Data do exame (opcional)<input type="date" value={f.exame} onChange={(e) => setF({ ...f, exame: e.target.value })} /></label>
          <label>Data da aprovação<input type="date" required value={f.aprov} onChange={(e) => setF({ ...f, aprov: e.target.value })} /></label>
          <label>Observações<input value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} /></label>
          {erro && <div className="err" role="alert">{erro}</div>}
          <div className="row"><button className="btn g">Salvar graduação</button><button type="button" className="btn s" onClick={() => setNovo(false)}>Cancelar</button></div>
        </form>
      )}
    </div>
  );
}
