import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { fmtData, hoje } from '../util.js';
import Avatar from './Avatar.jsx';

const WHATSAPP_EQUIPAMENTOS = `https://wa.me/5541984495122?text=${encodeURIComponent('Gostaria de saber sobre os equipamentos')}`;
const ROTULO = { aluno: 'Aluno', admin: 'Administrador', professor: 'Professor' };

export default function Home() {
  const { profile, isStaff, signOut } = useAuth();
  const [pend, setPend] = useState(null);
  const [total, setTotal] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const [lidos, setLidos] = useState(new Set());
  const [eventos, setEventos] = useState([]);
  const [faixa, setFaixa] = useState(null);
  const [freq, setFreq] = useState(undefined);

  useEffect(() => {
    if (!isStaff) return;
    const c = (s) => supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'aluno').eq('status', s);
    c('pendente').then(({ count }) => setPend(count ?? 0));
    c('aprovado').then(({ count }) => setTotal(count ?? 0));
  }, [isStaff]);

  useEffect(() => {
    const hj = hoje();
    Promise.all([
      supabase.from('announcements').select('id,title,important,pinned').or(`valid_until.is.null,valid_until.gte.${hj}`)
        .order('pinned', { ascending: false }).order('published_on', { ascending: false }).order('id', { ascending: false }).limit(30),
      supabase.from('announcement_reads').select('announcement_id').eq('user_id', profile.id),
      supabase.from('events').select('id,title,event_date,event_time').gte('event_date', hj).order('event_date').order('event_time').limit(3),
    ]).then(([a, r, e]) => {
      setAvisos(a.data || []); setLidos(new Set((r.data || []).map((x) => x.announcement_id))); setEventos(e.data || []);
    });
  }, [profile.id]);
  useEffect(() => {
    if (profile.role !== 'aluno') return;
    if (profile.belt_id) supabase.from('belts').select('name,color_hex').eq('id', profile.belt_id).single().then(({ data }) => setFaixa(data));
    supabase.from('student_attendance').select('total,presentes').eq('student_id', profile.id).maybeSingle()
      .then(({ data }) => setFreq(data || null));
  }, [profile.id, profile.belt_id]);
  const novos = avisos.filter((a) => !lidos.has(a.id)).length;

  return (
    <div className="wrap">
      <div className="row"><Avatar p={profile} size={52} />
        <div><div className="m">Olá,</div><h2>{profile.full_name || 'Bem-vindo'}</h2></div></div>
      <div className="m">{ROTULO[profile.role]}</div>
      {profile.role === 'aluno' && (
        <Link to="/meu-perfil" className="card" style={{ color: '#fff' }}>
          <div className="grid">
            <div>
              <div className="tag">Sua faixa</div>
              <div className="row" style={{ marginTop: 8 }}>
                {faixa && <span className="dot" style={{ background: faixa.color_hex, width: 18, height: 18 }} />}
                <span className="big" style={{ fontSize: 24 }}>{faixa ? faixa.name : profile.belt_id ? '…' : 'A definir'}</span>
              </div>
            </div>
            <div>
              <div className="tag">Frequência nas aulas</div>
              <div className="big" style={{ color: 'var(--green)', marginTop: 4 }}>
                {freq === undefined ? '…' : freq && freq.total ? `${Math.round((freq.presentes / freq.total) * 100)}%` : '—'}
              </div>
              <div className="m">{freq && freq.total ? `${freq.presentes} presenças · ${freq.total - freq.presentes} faltas` : 'Nenhuma chamada ainda'}</div>
            </div>
          </div>
        </Link>
      )}
      {isStaff && (
        <div className="grid">
          <Link to="/alunos" className="card" style={{ color: '#fff' }}>
            <div className="tag">Alunos ativos</div><div className="big">{total ?? '…'}</div></Link>
          <Link to="/aprovacoes" className="card" style={{ color: '#fff' }}>
            <div className="tag">Aprovações pendentes</div><div className="big">{pend ?? '…'}</div></Link>
        </div>
      )}
      <Link to="/avisos" className="card" style={{ color: '#fff' }}>
        <div className="row"><div className="tag f">Avisos recentes</div>{novos > 0 && <span className="chip" style={{ color: 'var(--red)' }}>{novos} {novos === 1 ? 'novo' : 'novos'}</span>}</div>
        {avisos.length === 0 && <div className="m" style={{ marginTop: 8 }}>Nenhum aviso no momento.</div>}
        {avisos.slice(0, 3).map((a) => (
          <div key={a.id} className="row" style={{ marginTop: 8 }}>
            {!lidos.has(a.id) && <span className="novo" role="img" aria-label="Não lido" />}
            <span className="f">{a.title}</span>{a.important && <span className="chip" style={{ color: 'var(--red)' }}>Importante</span>}
          </div>
        ))}
      </Link>
      <Link to="/calendario" className="card" style={{ color: '#fff' }}>
        <div className="tag">Próximos eventos</div>
        {eventos.length === 0 && <div className="m" style={{ marginTop: 8 }}>Nenhum evento marcado.</div>}
        {eventos.map((e) => (
          <div key={e.id} style={{ marginTop: 8 }}>{e.title}<div className="m">{fmtData(e.event_date)}{e.event_time ? ` · ${e.event_time.slice(0, 5)}` : ''}</div></div>
        ))}
      </Link>
      {isStaff && (
        <div className="grid">
          <Link to="/chamada" className="btn g" style={{ textAlign: 'center' }}>Realizar chamada</Link>
          <Link to="/chamadas" className="btn s" style={{ textAlign: 'center' }}>Histórico de chamadas</Link>
          <Link to="/turmas" className="btn s" style={{ textAlign: 'center' }}>Turmas</Link>
          <Link to="/cronogramas" className="btn s" style={{ textAlign: 'center' }}>Cronogramas</Link>
          <Link to="/relatorios" className="btn s" style={{ textAlign: 'center' }}>Relatórios de presença</Link>
          <Link to="/relatorios-gerais" className="btn s" style={{ textAlign: 'center' }}>Relatórios gerais</Link>
        </div>
      )}
      {profile.role === 'aluno' && <Link to="/carteirinha" className="btn g" style={{ textAlign: 'center' }}>Minha carteirinha</Link>}
      <Link to="/apostila" className="btn u" style={{ textAlign: 'center' }}>Apostila: história e cronograma</Link>
      <a href={WHATSAPP_EQUIPAMENTOS} target="_blank" rel="noopener noreferrer" className="btn g" style={{ textAlign: 'center', textDecoration: 'none', lineHeight: '20px' }}>Adquirir equipamentos (WhatsApp)</a>
      <Link to="/meu-perfil" className="btn u" style={{ textAlign: 'center' }}>Meu perfil</Link>
      <Link to="/configuracoes" className="btn s" style={{ textAlign: 'center' }}>Configurações</Link>
      <button className="btn s" onClick={signOut}>Sair</button>
    </div>
  );
}
