import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { CATEGORIAS } from '../util.js';

export default function Cronogramas() {
  const [belts, setBelts] = useState([]);
  const [belt, setBelt] = useState('');
  const [itens, setItens] = useState([]);
  const [cat, setCat] = useState('bases'); const [titulo, setTitulo] = useState(''); const [desc, setDesc] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    supabase.from('belts').select('*').order('track', { ascending: false }).order('position')
      .then(({ data }) => setBelts(data || []));
  }, []);

  const carregar = async () => {
    if (!belt) return setItens([]);
    const { data, error } = await supabase.from('belt_curriculum').select('*').eq('belt_id', belt).order('position');
    if (error) setErro('Não foi possível carregar o cronograma.'); else setItens(data);
  };
  useEffect(() => { carregar(); }, [belt]);

  const add = async (e) => {
    e.preventDefault(); setErro('');
    const { error } = await supabase.from('belt_curriculum').insert({
      belt_id: Number(belt), category: cat, title: titulo.trim(), description: desc.trim() || null, position: itens.length,
    });
    if (error) return setErro('Não foi possível adicionar o item.');
    setTitulo(''); setDesc(''); carregar();
  };
  const apagar = async (i) => {
    if (!confirm(`Remover "${i.title}"? O progresso dos alunos neste item também será removido.`)) return;
    const { error } = await supabase.from('belt_curriculum').delete().eq('id', i.id);
    if (error) setErro('Não foi possível remover.'); else carregar();
  };

  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Cronogramas por faixa</h2>
      <label>Faixa<select value={belt} onChange={(e) => setBelt(e.target.value)}>
        <option value="">Selecione…</option>
        {belts.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.track === 'infantil' ? 'infantil' : 'regular'})</option>)}
      </select></label>
      {erro && <div className="err" role="alert">{erro}</div>}
      {belt && (
        <>
          <form className="card" onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="tag">Novo item</div>
            <label>Categoria<select value={cat} onChange={(e) => setCat(e.target.value)}>
              {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label>Título<input required value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
            <label>Descrição (opcional)<input value={desc} onChange={(e) => setDesc(e.target.value)} /></label>
            <button className="btn g">Adicionar</button>
          </form>
          {itens.length === 0 && <div className="card m">Nenhum item nesta faixa ainda.</div>}
          {Object.entries(CATEGORIAS).map(([k, nome]) => {
            const doCat = itens.filter((i) => i.category === k);
            if (!doCat.length) return null;
            return (
              <div className="card" key={k}><div className="tag">{nome}</div>
                {doCat.map((i) => (
                  <div className="row" key={i.id} style={{ marginTop: 10 }}>
                    <div className="f"><div style={{ fontWeight: 600 }}>{i.title}</div>{i.description && <div className="m" style={{ whiteSpace: 'pre-wrap' }}>{i.description}</div>}</div>
                    <button className="btn s sm" onClick={() => apagar(i)}>Remover</button>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
