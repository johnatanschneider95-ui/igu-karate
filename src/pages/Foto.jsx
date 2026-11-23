import { useEffect, useState } from 'react';
import { supabase } from '../supabase.js';

export default function Foto({ path, alt = '' }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let ok = true; setUrl(null);
    if (path) supabase.storage.from('media').createSignedUrl(path, 3600).then(({ data }) => { if (ok) setUrl(data?.signedUrl || null); });
    return () => { ok = false; };
  }, [path]);
  return url ? <img src={url} alt={alt} style={{ maxWidth: '100%', borderRadius: 12 }} /> : null;
}
