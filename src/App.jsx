import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Recuperar from './pages/Recuperar.jsx';
import Pendente from './pages/Pendente.jsx';
import TrocarSenha from './pages/TrocarSenha.jsx';
import Aprovacoes from './pages/Aprovacoes.jsx';
import Home from './pages/Home.jsx';
import Alunos from './pages/Alunos.jsx';
import Perfil from './pages/Perfil.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import Chamada from './pages/Chamada.jsx';
import Historico from './pages/Historico.jsx';
import Turmas from './pages/Turmas.jsx';
import Cronogramas from './pages/Cronogramas.jsx';
import Relatorios from './pages/Relatorios.jsx';
import Avisos from './pages/Avisos.jsx';
import Calendario from './pages/Calendario.jsx';
import Apostila from './pages/Apostila.jsx';
import Carteirinha from './pages/Carteirinha.jsx';
import Certificado from './pages/Certificado.jsx';
import RelatoriosGerais from './pages/RelatoriosGerais.jsx';

function Guard({ children, staff }) {
  const { session, profile, loading, signOut } = useAuth();
  const { pathname } = useLocation();
  if (loading || (session && !profile)) return <p className="center">Carregando…</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile.status === 'rejeitado' || profile.status === 'inativo')
    return (
      <div className="wrap"><div className="card">
        <h2>Acesso indisponível</h2>
        <p className="m">Sua conta não está ativa. Fale com um professor do Instituto.</p>
        <button className="btn s" onClick={signOut}>Sair</button>
      </div></div>
    );
  if (profile.status === 'pendente') return <Navigate to="/pendente" replace />;
  if (profile.must_change_password && pathname !== '/trocar-senha')
    return <Navigate to="/trocar-senha" replace />;
  if (staff && !['admin', 'professor'].includes(profile.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { session, profile } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={session && profile?.status === 'aprovado' ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/pendente" element={<Pendente />} />
      <Route path="/trocar-senha" element={<Guard><TrocarSenha /></Guard>} />
      <Route path="/aprovacoes" element={<Guard staff><Aprovacoes /></Guard>} />
      <Route path="/alunos" element={<Guard staff><Alunos /></Guard>} />
      <Route path="/alunos/:id" element={<Guard staff><Perfil /></Guard>} />
      <Route path="/chamada" element={<Guard staff><Chamada /></Guard>} />
      <Route path="/chamadas" element={<Guard staff><Historico /></Guard>} />
      <Route path="/turmas" element={<Guard staff><Turmas /></Guard>} />
      <Route path="/cronogramas" element={<Guard staff><Cronogramas /></Guard>} />
      <Route path="/relatorios" element={<Guard staff><Relatorios /></Guard>} />
      <Route path="/avisos" element={<Guard><Avisos /></Guard>} />
      <Route path="/calendario" element={<Guard><Calendario /></Guard>} />
      <Route path="/certificado/:id" element={<Guard><Certificado /></Guard>} />
      <Route path="/relatorios-gerais" element={<Guard staff><RelatoriosGerais /></Guard>} />
      <Route path="/apostila" element={<Guard><Apostila /></Guard>} />
      <Route path="/carteirinha" element={<Guard><Carteirinha /></Guard>} />
      <Route path="/carteirinha/:id" element={<Guard staff><Carteirinha /></Guard>} />
      <Route path="/meu-perfil" element={<Guard><Perfil /></Guard>} />
      <Route path="/configuracoes" element={<Guard><Configuracoes /></Guard>} />
      <Route path="/" element={<Guard><Home /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
