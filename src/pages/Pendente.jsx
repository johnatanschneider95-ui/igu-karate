import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Brand from './Brand.jsx';

export default function Pendente() {
  const { session, profile, loading, refresh, signOut } = useAuth();
  if (loading) return <p className="center">Carregando…</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile?.status === 'aprovado') return <Navigate to="/" replace />;
  return (
    <div className="wrap"><Brand />
      <div className="card"><h2>Aguardando aprovação</h2>
        <p className="m">Seu cadastro foi recebido. Um professor ou administrador vai analisá-lo em breve.</p></div>
      <button className="btn u" onClick={refresh}>Verificar novamente</button>
      <button className="btn s" onClick={signOut}>Sair</button>
    </div>
  );
}
