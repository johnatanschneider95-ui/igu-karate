import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { idade } from '../util.js';
import Avatar from './Avatar.jsx';

export default function Configuracoes() {
  const { profile, refresh, signOut } = useAuth();
  const [f, setF] = useState({
    phone: profile.phone || '', guardian_name: profile.guardian_name || '', guardian_phone: profile.guardian_phone || '',
  });
  const [msg, setMsg] = useState(''); const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const menor = (idade(profile.birth_date) ?? 99) < 18;

  const salvar = async (e) => {
    e.preventDefault(); setErro(''); setMsg('');
    if (menor && (!f.guardian_name.trim() || !f.guardian_phone.trim())) return setErro('Informe nome e telefone do responsável.');
    const { error } = await supabase.from('profiles').update({
      phone: f.phone || null, guardian_name: f.guardian_name || null, guardian_phone: f.guardian_phone || null,
    }).eq('id', profile.id);
    if (error) return setErro('Não foi possível salvar.');
    await refresh(); setMsg('Dados salvos.');
  };

  const foto = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setErro(''); setMsg('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setErro('Use uma imagem JPG, PNG ou WebP.');
    if (file.size > 2 * 1024 * 1024) return setErro('A foto deve ter até 2 MB.');
    setBusy(true);
    const path = `${profile.id}/${Date.now()}.${file.type.split('/')[1]}`;
    const up = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); return setErro('Não foi possível enviar a foto.'); }
    await supabase.from('profiles').update({ photo_path: path }).eq('id', profile.id);
    if (profile.photo_path) await supabase.storage.from('avatars').remove([profile.photo_path]);
    await refresh(); setBusy(false); setMsg('Foto atualizada.');
  };

  return (
    <div className="wrap">
      <Link to="/">← Início</Link>
      <h2>Configurações</h2>
      <div className="card row">
        <Avatar p={profile} size={64} />
        <label className="f">Alterar foto (JPG, PNG ou WebP, até 2 MB)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={foto} disabled={busy} />
        </label>
      </div>
      <form className="card" onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="tag">Meus dados</div>
        <div className="m">{profile.full_name} · {profile.email}</div>
        <label>Telefone<input type="tel" value={f.phone} onChange={set('phone')} /></label>
        {menor && <>
          <label>Nome do responsável<input value={f.guardian_name} onChange={set('guardian_name')} /></label>
          <label>Telefone do responsável<input type="tel" value={f.guardian_phone} onChange={set('guardian_phone')} /></label>
        </>}
        <button className="btn g">Salvar dados</button>
      </form>
      {erro && <div className="err" role="alert">{erro}</div>}
      {msg && <div className="ok" role="status">{msg}</div>}
      <Link to="/trocar-senha" className="btn s" style={{ textAlign: 'center' }}>Alterar senha</Link>
      <button className="btn s" onClick={signOut}>Sair</button>
    </div>
  );
}
