import { useEffect, useState } from 'react';
import { supabase } from '../../supabase.js';
import { useAuth } from '../../auth.jsx';
import { CATEGORIAS, ESTADO } from '../../util.js';

export default function CronogramaAluno({ aluno, editavel }) {
  const { profile } = useAuth();
  const [itens, setItens] = useState(null);
  const [prog, setProg] = useState({});
  const [erro, setErro] = useState('');

  useEffect(() => {
    (async () => {
      const [i, p] = await Promise.all([
        supabase.from('belt_curriculum').select('*').eq('belt_id', aluno.belt_id).order('position'),
        supabase.from('student_curriculum_progress').select('item_id,state').eq('student_id', aluno.id),
      ]);
      if (i.error) return setErro('Não foi possível carregar o cronograma.');
      setItens(i.data); setProg(Object.fromEntries((p.data || []).map((r) => [r.item_id, r.state])));
    })();
  }, [aluno.id, aluno.belt_id]);

  const mudar = async (item, state) => {
    setErro('');
    const { error } = await supabase.from('student_curriculum_progress').upsert({
      student_id: aluno.id, item_id: item.id, state, validated_by: profile.id, validated_at: new Date().toISOString(),
    });
    if (error) return setErro('Não foi possível salvar a validação.');
    setProg({ ...prog, [item.id]: state });
  };

  if (!itens) return erro ? <div className="err">{erro}</div> : <p className="m">Carregando cronograma…</p>;
  const feitos = itens.filter((i) => prog[i.id] === 'concluido').length;
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="tag">Cronograma da faixa atual</div>
      {itens.length === 0 && <div className="m">O cronograma desta faixa ainda não foi cadastrado.</div>}
      {itens.length > 0 && <div className="m">{feitos} de {itens.length} itens concluídos. A graduação é decidida pelo professor.</div>}
      {erro && <div className="err" role="alert">{erro}</div>}
      {Object.entries(CATEGORIAS).map(([k, nome]) => {
        const doCat = itens.filter((i) => i.category === k);
        if (!doCat.length) return null;
        return (
          <div key={k}><div className="m" style={{ color: 'var(--lav)' }}>{nome}</div>
            {doCat.map((i) => (
              <div className="row" key={i.id} style={{ marginTop: 8 }}>
                <div className="f"><div>{i.title}</div>{i.description && <div className="m" style={{ whiteSpace: 'pre-wrap' }}>{i.description}</div>}</div>
                {editavel ? (
                  <select aria-label={`Estado de ${i.title}`} style={{ width: 'auto', marginTop: 0 }} value={prog[i.id] || 'pendente'} onChange={(e) => mudar(i, e.target.value)}>
                    {Object.entries(ESTADO).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                  </select>
                ) : <span className="chip" style={{ color: prog[i.id] === 'concluido' ? 'var(--green)' : 'var(--tx2)' }}>{ESTADO[prog[i.id] || 'pendente']}</span>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
