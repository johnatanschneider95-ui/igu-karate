import { supabase } from './supabase.js';

export async function subirMidia(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  if (file.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter até 2 MB.');
  const path = `${crypto.randomUUID()}.${file.type.split('/')[1]}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type });
  if (error) throw new Error('Não foi possível enviar a imagem.');
  return path;
}
export const apagarMidia = (path) => (path ? supabase.storage.from('media').remove([path]) : null);
