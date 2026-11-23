import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { trilha } from '../util.js';

export default function Aprovacoes() {
  const { profile } = useAuth();
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = async () => {
    const { data, error } = await supabase.from('profiles').select('*')
      .eq('status', 'pendente').order('created_at');
    if (error) setErro('Não foi possível carregar os cadastros.'); else setLista(data);
  };
  useEffect(() => { carregar(); }, []);

  const decidir = async (p, status) => {
    setErro('');
    const patch = { status };
    if (status === 'aprovado' && !p.belt_id) {
      // aluno aprovado começa na faixa branca da trilha da sua idade
      const { data: b } = await supabase.from('belts').select('id').eq('track', trilha(p.birth_date)).eq('position', 1).single();
      if (b) patch.belt_id = b.id;
    }
    const { error } = await supabase.from('profiles').update(patch).eq('id', p.id);
    if (error) return setErro('Não foi possível salvar a decisão.');
    await supabase.from('audit_log').insert({
      actor: profile.id, action: status === 'aprovado' ? 'aprovou_cadastro' : 'rejeitou_cadastro', target: p.id,
    });
    carregar();
  };

  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Aprovação de cadastros</h2>
      {erro && <div className="err" role="alert">{erro}</div>}
      {lista === null && <p className="m">Carregando…</p>}
      {lista?.length === 0 && <div className="card m">Nenhum cadastro pendente.</div>}
      {lista?.map((p) => (
        <div className="card row" key={p.id}>
          <div className="f">
            <div style={{ fontWeight: 600 }}>{p.full_name} {p.is_demo && <span className="tag">demo</span>}</div>
            <div className="m">{p.email} · Nasc. {p.birth_date ? new Date(p.birth_date + 'T00:00').toLocaleDateString('pt-BR') : '—'}</div>
            {p.guardian_name && <div className="m">Responsável: {p.guardian_name} · {p.guardian_phone}</div>}
            <div className="m">Solicitado em {new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
          </div>
          <button className="btn g sm" onClick={() => decidir(p, 'aprovado')}>Aprovar</button>
          <button className="btn s sm" onClick={() => decidir(p, 'rejeitado')}>Rejeitar</button>
        </div>
      ))}
    </div>
  );
}
