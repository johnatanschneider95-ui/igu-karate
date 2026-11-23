import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { fmtData } from '../util.js';
import Avatar from './Avatar.jsx';

export default function Carteirinha() {
  const { id } = useParams();
  const { profile } = useAuth();
  const nav = useNavigate();
  const alvo = id || profile.id;
  const [p, setP] = useState(null);
  const [desde, setDesde] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('profiles')
        .select('*, belts(name,color_hex), turma:classes!class_id(name)').eq('id', alvo).single();
      if (error) return setErro('Carteirinha não encontrada.');
      setP(data);
      // início da faixa atual: aprovação da última graduação para essa faixa; sem graduação (ex.: faixa branca), a data de entrada
      let inicio = data.joined_at;
      if (data.belt_id) {
        const g = await supabase.from('graduations').select('approved_date').eq('student_id', alvo)
          .eq('to_belt_id', data.belt_id).order('approved_date', { ascending: false }).limit(1);
        if (g.data?.[0]) inicio = g.data[0].approved_date;
      }
      setDesde(inicio);
    })();
  }, [alvo]);

  if (erro) return <div className="wrap"><div className="err">{erro}</div><button className="btn s" onClick={() => nav(-1)}>Voltar</button></div>;
  if (!p) return <p className="center">Carregando…</p>;
  const pronta = p.role === 'aluno' && p.status === 'aprovado' && p.belts;

  return (
    <div className="wrap">
      <div className="row no-print">
        <button className="btn s sm" onClick={() => nav(-1)}>← Voltar</button>
        {pronta && <button className="btn g f" onClick={() => window.print()}>Imprimir ou salvar em PDF</button>}
      </div>
      <h2 className="no-print">Carteirinha</h2>
      {!pronta && <div className="card m">A carteirinha fica disponível depois que o cadastro é aprovado e a faixa é definida.</div>}
      {pronta && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="carteira">
            <div className="listra" />
            <div className="corpo">
              <div className="row" style={{ gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #DF525B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10 }}>IGU</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em' }}>INSTITUTO GERANDO UNIDADE</div>
                  <div style={{ fontSize: 9, color: '#B6A5E8' }}>IGU Karatê · Carteirinha do atleta</div>
                </div>
              </div>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <Avatar p={p} size={72} />
                <div className="f" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{p.full_name}</div>
                  <div className="lbl" style={{ marginTop: 6 }}>Faixa atual</div>
                  <div className="val row" style={{ gap: 6 }}><span className="dot" style={{ background: p.belts.color_hex }} />{p.belts.name}</div>
                  <div className="lbl" style={{ marginTop: 4 }}>Faixa atual desde</div>
                  <div className="val">{fmtData(desde)}</div>
                </div>
              </div>
              <div style={{ fontSize: 8, color: '#B6A5E8', textAlign: 'center', letterSpacing: '.1em' }}>Disciplina. Respeito. Evolução.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
