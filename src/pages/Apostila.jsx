import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { CATEGORIAS } from '../util.js';
import dados from '../data/apostila.js';

function Texto({ md }) {
  const els = []; let tab = [];
  const flush = () => {
    if (!tab.length) return;
    els.push(<div key={`t${els.length}`} style={{ overflowX: 'auto' }}><table className="tbl"><tbody>
      {tab.map((r, i) => <tr key={i}>{r.map((c, j) => (i === 0 ? <th key={j} className="nm">{c}</th> : <td key={j} className="nm" style={{ whiteSpace: 'normal' }}>{c}</td>))}</tr>)}
    </tbody></table></div>);
    tab = [];
  };
  md.split('\n').forEach((l, i) => {
    if (l.startsWith('|')) { tab.push(l.split('|').slice(1, -1).map((s) => s.trim())); return; }
    flush();
    if (l.startsWith('### ')) els.push(<h3 key={i} style={{ margin: '16px 0 4px', fontSize: 16, color: 'var(--lav)' }}>{l.slice(4)}</h3>);
    else if (l.startsWith('- ')) els.push(<li key={i} style={{ marginLeft: 18, lineHeight: 1.5 }}>{l.slice(2)}</li>);
    else if (l.trim()) els.push(<p key={i} style={{ margin: '6px 0', lineHeight: 1.55 }}>{l}</p>);
  });
  flush();
  return <div>{els}</div>;
}

function Cronograma() {
  const { profile, isStaff } = useAuth();
  const [track, setTrack] = useState('regular');
  const [belts, setBelts] = useState([]);
  const [belt, setBelt] = useState('');
  const [itens, setItens] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('belts').select('*').order('position');
      setBelts(data || []);
      const minha = (data || []).find((b) => b.id === profile.belt_id);
      if (minha) { setTrack(minha.track); setBelt(String(minha.id)); }
    })();
  }, []);
  const faixas = belts.filter((b) => b.track === track);
  useEffect(() => { if (!faixas.some((b) => String(b.id) === belt)) setBelt(faixas[0] ? String(faixas[0].id) : ''); }, [track, belts]);
  useEffect(() => {
    if (!belt) return;
    setItens(null);
    supabase.from('belt_curriculum').select('*').eq('belt_id', belt).order('position').then(({ data }) => setItens(data || []));
  }, [belt]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="row">
        <button className={`btn f ${track === 'infantil' ? 'u' : 's'}`} aria-pressed={track === 'infantil'} onClick={() => setTrack('infantil')}>Infantil</button>
        <button className={`btn f ${track === 'regular' ? 'u' : 's'}`} aria-pressed={track === 'regular'} onClick={() => setTrack('regular')}>Regular</button>
      </div>
      <label>Faixa atual<select value={belt} onChange={(e) => setBelt(e.target.value)}>
        {faixas.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      {isStaff && <Link to="/cronogramas" className="m">Editar cronogramas →</Link>}
      {itens === null && <p className="m">Carregando…</p>}
      {itens?.length === 0 && <div className="card m">O cronograma desta faixa ainda não foi cadastrado.</div>}
      {itens && Object.entries(CATEGORIAS).map(([k, nome]) => {
        const doCat = itens.filter((i) => i.category === k);
        if (!doCat.length) return null;
        return (
          <div className="card" key={k}><div className="tag">{nome}</div>
            {doCat.map((i) => (
              <div key={i.id} style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 600 }}>{i.title}</div>
                {i.description && <div className="m" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{i.description}</div>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

const ABAS = [['historia', 'História'], ['cronograma', 'Cronograma por faixa'], ['tecnicas', 'Kumites e bunkais'], ['dicionario', 'Dicionário']];

export default function Apostila() {
  const [aba, setAba] = useState('historia');
  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Apostila</h2>
      <div className="m">Associação Okinawa de Karatê-Dô Goju-Ryu</div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {ABAS.map(([k, n]) => <button key={k} className={`btn sm ${aba === k ? 'u' : 's'}`} aria-pressed={aba === k} onClick={() => setAba(k)}>{n}</button>)}
      </div>
      {aba === 'historia' && dados.historia.map((s, i) => (
        <details key={s.titulo} className="card" open={i === 0}>
          <summary style={{ cursor: 'pointer', fontWeight: 800 }}>{s.titulo}</summary>
          <Texto md={s.texto} />
        </details>
      ))}
      {aba === 'cronograma' && <Cronograma />}
      {aba === 'tecnicas' && <div className="card"><Texto md={dados.referencia} /></div>}
      {aba === 'dicionario' && <div className="card"><Texto md={dados.dicionario} /></div>}
    </div>
  );
}
