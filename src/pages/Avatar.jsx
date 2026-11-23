import { useEffect, useState } from 'react';
import { supabase } from '../supabase.js';
import { iniciais } from '../util.js';

export default function Avatar({ p, size = 44 }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let ok = true;
    setUrl(null);
    if (p?.photo_path)
      supabase.storage.from('avatars').createSignedUrl(p.photo_path, 3600)
        .then(({ data }) => { if (ok) setUrl(data?.signedUrl || null); });
    return () => { ok = false; };
  }, [p?.photo_path]);
  const st = {
    width: size, height: size, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--bd)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
    color: 'var(--lav)', fontSize: size / 3, flexShrink: 0, overflow: 'hidden',
  };
  return (
    <div style={st} aria-hidden="true">
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciais(p?.full_name)}
    </div>
  );
}
