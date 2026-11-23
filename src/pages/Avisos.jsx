import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { CAT_AVISO, PUBLICO, fmtData, hoje } from '../util.js';
import { subirMidia, apagarMidia } from '../media.js';
import Foto from './Foto.jsx';

function AvisoForm({ inicial, eventos, onSaved, onCancel }) {
  const { profile } = useAuth();
  const [f, setF] = useState({
    title: inicial?.title || '', body: inicial?.body || '', category: inicial?.category || 'geral',
    audience: inicial?.audience || 'todos', valid_until: inicial?.valid_until || '',
    important: inicial?.important || false, pinned: inicial?.pinned || false, event_id: inicial?.event_id || '',
  });
  const [arq, setArq] = useState(null); const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const salvar = async (e) => {
    e.preventDefault(); setErro(''); setBusy(true);
    try {
      let image_path = inicial?.image_path || null;
      if (arq) { const novo = await subirMidia(arq); if (image_path) apagarMidia(image_path); image_path = novo; }
      const payload = {
        title: f.title.trim(), body: f.body.trim(), category: f.category, audience: f.audience,
        valid_until: f.valid_until || null, important: f.important, pinned: f.pinned,
        event_id: f.event_id ? Number(f.event_id) : null, image_path,
      };
      const { error } = inicial
        ? await supabase.from('announcements').update(payload).eq('id', inicial.id)
        : await supabase.from('announcements').insert({ ...payload, author_id: profile.id, author_name: profile.full_name });
      if (error) throw new Error('Não foi possível salvar o aviso.');
      onSaved();
    } catch (err) { setErro(err.message); setBusy(false); }
  };

  return (
    <form className="card" onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="tag">{inicial ? 'Editar aviso' : 'Novo aviso'}</div>
      <label>Título<input required value={f.title} onChange={set('title')} /></label>
      <label>Texto<textarea required rows={5} value={f.body} onChange={set('body')} /></label>
      <div className="grid">
        <label>Categoria<select value={f.category} onChange={set('category')}>{Object.entries(CAT_AVISO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Público<select value={f.audience} onChange={set('audience')}>{Object.entries(PUBLICO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Validade (opcional)<input type="date" value={f.valid_until} onChange={set('valid_until')} /></label>
      </div>
      <label>Evento relacionado (opcional)<select value={f.event_id} onChange={set('event_id')}>
        <option value="">Nenhum</option>{eventos.map((ev) => <option key={ev.id} value={ev.id}>{ev.title} · {fmtData(ev.event_date)}</option>)}</select></label>
      <label>Imagem (JPG, PNG ou WebP, até 2 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setArq(e.target.files[0] || null)} /></label>
      <label className="row" style={{ gap: 8 }}><input type="checkbox" checked={f.important} onChange={set('important')} style={{ width: 20, marginTop: 0 }} /><span>Marcar como importante</span></label>
      <label className="row" style={{ gap: 8 }}><input type="checkbox" checked={f.pinned} onChange={set('pinned')} style={{ width: 20, marginTop: 0 }} /><span>Fixar no topo</span></label>
      {erro && <div className="err" role="alert">{erro}</div>}
      <div className="row"><button className="btn g" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button><button type="button" className="btn s" onClick={onCancel}>Cancelar</button></div>
    </form>
  );
}

export default function Avisos() {
  const { profile, isStaff } = useAuth();
  const [lista, setLista] = useState(null);
  const [lidos, setLidos] = useState(new Set());
  const [leituras, setLeituras] = useState({});
  const [eventos, setEventos] = useState([]);
  const [cat, setCat] = useState(''); const [antigos, setAntigos] = useState(false);
  const [aberto, setAberto] = useState(null); const [form, setForm] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = async () => {
    const [a, r, e, all] = await Promise.all([
      supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('published_on', { ascending: false }).order('id', { ascending: false }),
      supabase.from('announcement_reads').select('announcement_id').eq('user_id', profile.id),
      supabase.from('events').select('id,title,event_date').order('event_date', { ascending: false }).limit(60),
      isStaff ? supabase.from('announcement_reads').select('announcement_id') : Promise.resolve({ data: [] }),
    ]);
    if (a.error) return setErro('Não foi possível carregar os avisos.');
    setLista(a.data); setEventos(e.data || []);
    setLidos(new Set((r.data || []).map((x) => x.announcement_id)));
    const c = {}; (all.data || []).forEach((x) => { c[x.announcement_id] = (c[x.announcement_id] || 0) + 1; }); setLeituras(c);
  };
  useEffect(() => { carregar(); }, []);

  const abrir = async (a) => {
    setAberto(aberto === a.id ? null : a.id);
    if (!lidos.has(a.id)) {
      await supabase.from('announcement_reads').upsert({ announcement_id: a.id, user_id: profile.id }, { onConflict: 'announcement_id,user_id', ignoreDuplicates: true });
      setLidos(new Set([...lidos, a.id]));
    }
  };
  const alternar = async (a, campo) => {
    const { error } = await supabase.from('announcements').update({ [campo]: !a[campo] }).eq('id', a.id);
    if (error) setErro('Não foi possível atualizar o aviso.'); else carregar();
  };
  const excluir = async (a) => {
    if (!confirm(`Excluir o aviso "${a.title}"?`)) return;
    const { error } = await supabase.from('announcements').delete().eq('id', a.id);
    if (error) return setErro('Não foi possível excluir o aviso.');
    apagarMidia(a.image_path); carregar();
  };

  const expirado = (a) => a.valid_until && a.valid_until < hoje();
  const vis = (lista || []).filter((a) => (!cat || a.category === cat) && (antigos || !expirado(a)));
  const titEvento = (id) => eventos.find((e) => e.id === id)?.title;

  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Avisos</h2>
      {isStaff && !form && <button className="btn u" onClick={() => setForm({})}>Novo aviso</button>}
      {form && <AvisoForm inicial={form.id ? form : null} eventos={eventos} onCancel={() => setForm(null)} onSaved={() => { setForm(null); carregar(); }} />}
      <div className="grid">
        <label>Categoria<select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Todas</option>
          {Object.entries(CAT_AVISO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label className="row" style={{ gap: 8, alignSelf: 'end', paddingBottom: 12 }}><input type="checkbox" checked={antigos} onChange={(e) => setAntigos(e.target.checked)} style={{ width: 20, marginTop: 0 }} /><span>Mostrar avisos vencidos</span></label>
      </div>
      {erro && <div className="err" role="alert">{erro}</div>}
      {lista === null && !erro && <p className="m">Carregando…</p>}
      {lista && vis.length === 0 && <div className="card m">Nenhum aviso por aqui.</div>}
      {vis.map((a) => (
        <div className="card" key={a.id} style={{ borderColor: a.important ? 'var(--red)' : undefined, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => abrir(a)} aria-expanded={aberto === a.id} style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {!lidos.has(a.id) && <span className="novo" role="img" aria-label="Não lido" />}
              <span style={{ fontWeight: 800, fontSize: 17 }} className="f">{a.title}</span>
              <span className="chip">{CAT_AVISO[a.category]}</span>
              {a.pinned && <span className="chip" style={{ color: 'var(--lav)' }}>Fixado</span>}
              {a.important && <span className="chip" style={{ color: 'var(--red)' }}>Importante</span>}
              {expirado(a) && <span className="chip">Vencido</span>}
            </div>
            <div className="m">{fmtData(a.published_on)}{a.author_name ? ` · ${a.author_name}` : ''}{isStaff ? ` · ${PUBLICO[a.audience]} · ${leituras[a.id] || 0} leituras` : ''}</div>
          </button>
          {aberto === a.id && <>
            <div style={{ whiteSpace: 'pre-wrap' }}>{a.body}</div>
            <Foto path={a.image_path} alt="" />
            {a.event_id && titEvento(a.event_id) && <Link to="/calendario">Evento: {titEvento(a.event_id)}</Link>}
            {isStaff && <div className="row" style={{ flexWrap: 'wrap' }}>
              <button className="btn s sm" onClick={() => setForm(a)}>Editar</button>
              <button className="btn s sm" onClick={() => alternar(a, 'pinned')}>{a.pinned ? 'Desafixar' : 'Fixar'}</button>
              <button className="btn s sm" onClick={() => alternar(a, 'important')}>{a.important ? 'Tirar importante' : 'Marcar importante'}</button>
              <button className="btn s sm" style={{ color: 'var(--red)' }} onClick={() => excluir(a)}>Excluir</button>
            </div>}
          </>}
        </div>
      ))}
    </div>
  );
}
