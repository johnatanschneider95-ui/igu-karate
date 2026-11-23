import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { TIPO_CERT, fmtData } from '../util.js';

const TEXTO = {
  participacao: (t) => `participou de ${t}.`,
  campeonato: (t) => `participou do campeonato ${t}.`,
  graduacao: (t) => `foi graduado(a) à faixa ${t}, após avaliação do professor responsável.`,
  reconhecimento: (t) => `recebe este certificado em reconhecimento por ${t}.`,
};

export default function Certificado() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState(null);
  const [erro, setErro] = useState('');
  useEffect(() => {
    supabase.from('certificates').select('*, aluno:profiles!student_id(full_name)').eq('id', id).single()
      .then(({ data, error }) => { if (error) setErro('Certificado não encontrado.'); else setC(data); });
  }, [id]);

  if (erro) return <div className="wrap"><div className="err">{erro}</div><button className="btn s" onClick={() => nav(-1)}>Voltar</button></div>;
  if (!c) return <p className="center">Carregando…</p>;
  return (
    <div className="wrap wide">
      <div className="row no-print">
        <button className="btn s sm" onClick={() => nav(-1)}>← Voltar</button>
        <button className="btn g f" onClick={() => window.print()}>Imprimir ou salvar em PDF</button>
      </div>
      <div className="cert">
        <div className="logo">IGU</div>
        <div style={{ fontWeight: 700 }}>Instituto Gerando Unidade</div>
        <h3>CERTIFICADO DE {TIPO_CERT[c.type].toUpperCase()}</h3>
        <div>Certificamos que</div>
        <div className="nome">{c.aluno?.full_name}</div>
        <div style={{ fontSize: 18, maxWidth: 560 }}>{TEXTO[c.type](c.title)}</div>
        {c.notes && <div style={{ fontStyle: 'italic' }}>{c.notes}</div>}
        <div style={{ marginTop: 8 }}>Emitido em {fmtData(c.issued_on)}</div>
        <div className="ass">{c.teacher_name || 'Professor responsável'}<br />Professor responsável</div>
        <div style={{ color: '#B6A5E8', fontSize: 13, letterSpacing: '.1em' }}>Disciplina. Respeito. Evolução.</div>
      </div>
    </div>
  );
}
