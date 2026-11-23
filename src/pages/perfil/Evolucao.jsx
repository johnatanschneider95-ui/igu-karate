import { useEffect, useState } from 'react';
import { supabase } from '../../supabase.js';
import { useAuth } from '../../auth.jsx';
import { fmtData } from '../../util.js';

const CATS = ['Geral', 'Bases', 'Técnicas', 'Defesas', 'Ataques', 'Kata', 'Kumite', 'Condicionamento', 'Disciplina', 'Comportamento', 'Metas'];

export default function Evolucao({ aluno, gerente }) {
  const { profile } = useAuth();
  const [lista, setLista] = useState(null);
  const [cat, setCat] = useState('Geral'); const [txt, setTxt] = useState(''); const [priv, setPriv] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = () => supabase.from('evolution_notes').select('*').eq('student_id', aluno.id)
    .order('created_at', { ascending: false }).then(({ data }) => setLista(data || []));
  useEffect(() => { carregar(); }, [aluno.id]);

  const salvar = async (e) => {
    e.preventDefault(); setErro('');
    const { error } = await supabase.from('evolution_notes').insert({
      student_id: aluno.id, teacher_id: profile.id, teacher_name: profile.full_name,
      category: cat, content: txt.trim(), private: priv,
    });
    if (error) return setErro('Não foi possível salvar o registro.');
    setTxt(''); setPriv(false); carregar();
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="tag">Evolução</div>
      {gerente && (
        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label>Categoria<select value={cat} onChange={(e) => setCat(e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Registro (use linguagem positiva e construtiva)<input required value={txt} onChange={(e) => setTxt(e.target.value)} /></label>
          <label className="row" style={{ gap: 8 }}><input type="checkbox" checked={priv} onChange={(e) => setPriv(e.target.checked)} style={{ width: 20, marginTop: 0 }} />
            <span>Só professores podem ver</span></label>
          {erro && <div className="err" role="alert">{erro}</div>}
          <button className="btn g">Adicionar registro</button>
        </form>
      )}
      {lista === null && <div className="m">Carregando…</div>}
      {lista?.length === 0 && <div className="m">Nenhum registro de evolução ainda.</div>}
      {lista?.map((n) => (
        <div key={n.id}>
          <div className="m"><span style={{ color: 'var(--lav)' }}>{n.category}</span> · {fmtData(n.created_at)}{n.teacher_name ? ` · ${n.teacher_name}` : ''}{n.private ? ' · privado' : ''}</div>
          <div>{n.content}</div>
        </div>
      ))}
    </div>
  );
}
