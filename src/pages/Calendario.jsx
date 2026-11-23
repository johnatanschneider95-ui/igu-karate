import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { CAT_EVENTO, PUBLICO, fmtData, hoje, diaSemana } from '../util.js';
import { subirMidia, apagarMidia } from '../media.js';
import Foto from './Foto.jsx';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function EventoForm({ inicial, dataPadrao, onSaved, onCancel }) {
  const { profile } = useAuth();
  const [f, setF] = useState({
    title: inicial?.title || '', description: inicial?.description || '', event_date: inicial?.event_date || dataPadrao,
    event_time: (inicial?.event_time || '').slice(0, 5), location: inicial?.location || '',
    category: inicial?.category || 'treino', audience: inicial?.audience || 'todos', notes: inicial?.notes || '',
  });
  const [arq, setArq] = useState(null); const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const salvar = async (e) => {
    e.preventDefault(); setErro(''); setBusy(true);
    try {
      let image_path = inicial?.image_path || null;
      if (arq) { const novo = await subirMidia(arq); if (image_path) apagarMidia(image_path); image_path = novo; }
      const payload = {
        title: f.title.trim(), description: f.description.trim() || null, event_date: f.event_date, event_time: f.event_time || null,
        location: f.location.trim() || null, category: f.category, audience: f.audience, notes: f.notes.trim() || null, image_path,
      };
      const { error } = inicial
        ? await supabase.from('events').update(payload).eq('id', inicial.id)
        : await supabase.from('events').insert({ ...payload, author_id: profile.id });
      if (error) throw new Error('Não foi possível salvar o evento.');
      onSaved();
    } catch (err) { setErro(err.message); setBusy(false); }
  };

  return (
    <form className="card" onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="tag">{inicial ? 'Editar evento' : 'Novo evento'}</div>
      <label>Nome<input required value={f.title} onChange={set('title')} /></label>
      <div className="grid">
        <label>Data<input type="date" required value={f.event_date} onChange={set('event_date')} /></label>
        <label>Horário<input type="time" value={f.event_time} onChange={set('event_time')} /></label>
        <label>Categoria<select value={f.category} onChange={set('category')}>{Object.entries(CAT_EVENTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Público<select value={f.audience} onChange={set('audience')}>{Object.entries(PUBLICO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      </div>
      <label>Local<input value={f.location} onChange={set('location')} /></label>
      <label>Descrição<textarea rows={3} value={f.description} onChange={set('description')} /></label>
      <label>Observações<input value={f.notes} onChange={set('notes')} /></label>
      <label>Foto (JPG, PNG ou WebP, até 2 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setArq(e.target.files[0] || null)} /></label>
      {erro && <div className="err" role="alert">{erro}</div>}
      <div className="row"><button className="btn g" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button><button type="button" className="btn s" onClick={onCancel}>Cancelar</button></div>
    </form>
  );
}

export default function Calendario() {
  const { profile, isStaff } = useAuth();
  const [mes, setMes] = useState(hoje().slice(0, 7));
  const [sel, setSel] = useState('');
  const [eventos, setEventos] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [form, setForm] = useState(null);
  const [erro, setErro] = useState('');
  const [y, m] = mes.split('-').map(Number);

  const carregar = async () => {
    const ini = `${mes}-01`, fim = `${mes}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`;
    const { data, error } = await supabase.from('events').select('*').gte('event_date', ini).lte('event_date', fim).order('event_date').order('event_time');
    if (error) return setErro('Não foi possível carregar os eventos.');
    setEventos(data);
    if (data.length) {
      const r = await supabase.from('event_rsvps').select('event_id,user_id,status').in('event_id', data.map((e) => e.id));
      setRsvps(r.data || []);
    } else setRsvps([]);
  };
  useEffect(() => { setEventos(null); carregar(); }, [mes]);

  const nav = (delta) => {
    const d = new Date(y, m - 1 + delta, 1);
    setMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); setSel('');
  };
  const dataStr = (d) => `${mes}-${String(d).padStart(2, '0')}`;
  const celulas = [...Array(new Date(y, m - 1, 1).getDay()).fill(null), ...Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => i + 1)];
  const doDia = (d) => (eventos || []).filter((e) => e.event_date === dataStr(d));

  const minha = (id) => rsvps.find((r) => r.event_id === id && r.user_id === profile.id)?.status;
  const confirmados = (id) => rsvps.filter((r) => r.event_id === id && r.status === 'vou').length;
  const responder = async (e, status) => {
    const { error } = await supabase.from('event_rsvps').upsert({ event_id: e.id, user_id: profile.id, status, updated_at: new Date().toISOString() });
    if (error) setErro('Não foi possível registrar sua resposta.'); else carregar();
  };
  const excluir = async (e) => {
    if (!confirm(`Excluir o evento "${e.title}"?`)) return;
    const { error } = await supabase.from('events').delete().eq('id', e.id);
    if (error) return setErro('Não foi possível excluir o evento.');
    apagarMidia(e.image_path); carregar();
  };

  const lista = (eventos || []).filter((e) => !sel || e.event_date === sel);

  return (
    <div className="wrap wide">
      <Link to="/">← Início</Link>
      <h2>Calendário e eventos</h2>
      {isStaff && !form && <button className="btn u" onClick={() => setForm({})}>Novo evento</button>}
      {form && <EventoForm inicial={form.id ? form : null} dataPadrao={sel || hoje()} onCancel={() => setForm(null)} onSaved={() => { setForm(null); carregar(); }} />}
      <div className="row">
        <button className="btn s sm" onClick={() => nav(-1)} aria-label="Mês anterior">‹</button>
        <div className="f" style={{ textAlign: 'center', fontWeight: 800 }}>{MESES[m - 1]} {y}</div>
        <button className="btn s sm" onClick={() => nav(1)} aria-label="Próximo mês">›</button>
      </div>
      <div className="cal">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i} className="sem">{d}</div>)}
        {celulas.map((d, i) => d === null ? <div key={i} /> : (
          <button key={i} className={`dia${sel === dataStr(d) ? ' sel' : ''}${dataStr(d) === hoje() ? ' hoje' : ''}`}
            aria-label={`Dia ${d}, ${doDia(d).length} eventos`} aria-pressed={sel === dataStr(d)}
            onClick={() => setSel(sel === dataStr(d) ? '' : dataStr(d))}>
            {d}<div>{doDia(d).slice(0, 3).map((e) => <span className="pt" key={e.id} />)}</div>
          </button>
        ))}
      </div>
      {sel && <button className="btn s" onClick={() => setSel('')}>Ver o mês todo</button>}
      {erro && <div className="err" role="alert">{erro}</div>}
      {eventos === null && !erro && <p className="m">Carregando…</p>}
      {eventos && lista.length === 0 && <div className="card m">Nenhum evento {sel ? 'neste dia' : 'neste mês'}.</div>}
      {lista.map((e) => (
        <div className="card" key={e.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 17 }} className="f">{e.title}</span>
            <span className="chip">{CAT_EVENTO[e.category]}</span>
            {isStaff && <span className="chip">{PUBLICO[e.audience]}</span>}
          </div>
          <div className="m">{fmtData(e.event_date)} · {diaSemana(e.event_date)}{e.event_time ? ` · ${e.event_time.slice(0, 5)}` : ''}{e.location ? ` · ${e.location}` : ''}</div>
          {e.description && <div style={{ whiteSpace: 'pre-wrap' }}>{e.description}</div>}
          {e.notes && <div className="m">{e.notes}</div>}
          <Foto path={e.image_path} alt="" />
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className={`btn sm ${minha(e.id) === 'vou' ? 'g' : 's'}`} aria-pressed={minha(e.id) === 'vou'} onClick={() => responder(e, 'vou')}>Vou participar</button>
            <button className={`btn sm ${minha(e.id) === 'nao_vou' ? '' : 's'}`} aria-pressed={minha(e.id) === 'nao_vou'} onClick={() => responder(e, 'nao_vou')}>Não vou</button>
            {isStaff && <span className="m">{confirmados(e.id)} confirmados</span>}
          </div>
          {isStaff && <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn s sm" onClick={() => setForm(e)}>Editar</button>
            <button className="btn s sm" style={{ color: 'var(--red)' }} onClick={() => excluir(e)}>Excluir</button>
          </div>}
        </div>
      ))}
    </div>
  );
}
