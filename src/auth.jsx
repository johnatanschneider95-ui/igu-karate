import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (s) => {
    if (!s) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', s.user.id).single();
    setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await load(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => load(s), 0); // evita travar dentro do callback do Supabase
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = {
    session, profile, loading,
    refresh: () => load(session),
    signOut: () => supabase.auth.signOut(),
    isStaff: ['admin', 'professor'].includes(profile?.role) && profile?.status === 'aprovado',
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
