import { useEffect, useState } from 'react';
import { supabase } from '../../supabase.js';
import { useAuth } from '../../auth.jsx';
import { CAT_CONQUISTA, fmtData, hoje } from '../../util.js';
import { subirMidia, apagarMidia } from '../../media.js';
import Foto from '../Foto.jsx';

export default function Conquistas({ aluno, gerente }) {
  const { profile } = useAuth();
  const [lista, setLista] = useState(null);
  const [novo, setNovo] = useState(false);
  const [f, setF] = useState({ title: '', description: '', achieved_on: hoje(), category: 'medalha' });
  const [arq, setArq] = useState(null); const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const carregar = () => supabase.from('achievements').select('*').eq('student_id', aluno.id)
    .order('achieved_on', { ascending: false }).then(({ data }) => setLista(data || []));
  useEffect(() => { carregar(); }, [aluno.id]);

  const salvar = async (e) => {
    e.preventDefault(); setErro(''); setBusy(true);
    try {
      const image_path = arq ? await subirMidia(arq) : null;
      const { error } = await supabase.from('achievements').insert({
        student_id: aluno.id, title: f.title.trim(), description: f.description.trim() || null,
        achieved_on: f.achieved_on, category: f.category, image_path, teacher_id: profile.id, teacher_name: profile.full_name,
      });
      if (error) throw new Error('Não foi possível salvar a conquista.');
      setNovo(false); setArq(null); setF({ title: '', description: '', achieved_on: hoje(), category: 'medalha' }); carregar();
    } catch (err) { setErro(err.message); }
    setBusy(false);
  };
  const excluir = async (c) => {
    if (!confirm(`Excluir a conquista "${c.title}"?`)) return;
    const { error } = await supabase.from('achievements').delete().eq('id', c.id);
    if (error) return setErro('Não foi possível excluir.');
    apagarMidia(c.image_path); carregar();
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="tag">Conquistas</div>
      {lista === null && <div className="m">Carregando…</div>}
      {lista?.length === 0 && <div className="m">Nenhuma conquista registrada ainda.</div>}
      {lista?.map((c) => (
        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <span className="f" style={{ fontWeight: 600 }}>{c.title}</span><span className="chip">{CAT_CONQUISTA[c.category]}</span>
          </div>
          <div className="m">{fmtData(c.achieved_on)}{c.teacher_name ? ` · ${c.teacher_name}` : ''}{c.description ? ` · ${c.description}` : ''}</div>
          {c.image_path && <div style={{ maxWidth: 220 }}><Foto path={c.image_path} alt={`Foto da conquista ${c.title}`} /></div>}
          {gerente && <div><button className="btn s sm" style={{ color: 'var(--red)' }} onClick={() => excluir(c)}>Excluir</button></div>}
        </div>
      ))}
      {erro && !novo && <div className="err" role="alert">{erro}</div>}
      {gerente && !novo && <button className="btn u" onClick={() => setNovo(true)}>Registrar conquista</button>}
      {gerente && novo && (
        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>Título<input required value={f.title} onChange={set('title')} /></label>
          <label>Categoria<select value={f.category} onChange={set('category')}>{Object.entries(CAT_CONQUISTA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label>Data<input type="date" required value={f.achieved_on} onChange={set('achieved_on')} /></label>
          <label>Descrição (opcional)<input value={f.description} onChange={set('description')} /></label>
          <label>Foto (opcional, até 2 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setArq(e.target.files[0] || null)} /></label>
          {erro && <div className="err" role="alert">{erro}</div>}
          <div className="row"><button className="btn g" disabled={busy}>Salvar conquista</button><button type="button" className="btn s" onClick={() => setNovo(false)}>Cancelar</button></div>
        </form>
      )}
    </div>
  );
}
