export const idade = (d) => {
  if (!d) return null;
  const n = new Date(), b = new Date(d + 'T00:00');
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
};
export const trilha = (d) => { const a = idade(d); return a !== null && a < 10 ? 'infantil' : 'regular'; };
export const STATUS = { aprovado: 'Ativo', pendente: 'Pendente', rejeitado: 'Rejeitado', inativo: 'Inativo' };
export const COR_STATUS = { aprovado: 'var(--green)', pendente: 'var(--lav)', rejeitado: 'var(--red)', inativo: 'var(--tx2)' };
export const fmtData = (d) => (d ? new Date(d.length === 10 ? d + 'T00:00' : d).toLocaleDateString('pt-BR') : '—');
export const iniciais = (n = '') => n.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
export const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const diaSemana = (d) => DIAS[new Date(d + 'T00:00').getDay()];
export const hoje = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const CATEGORIAS = {
  bases: 'Bases', defesa: 'Técnicas de defesa', ataque: 'Técnicas de ataque', kata: 'Kata', kumite: 'Kumite',
  condicionamento: 'Condicionamento', teoria: 'Teoria', disciplina: 'Disciplina', observacoes: 'Observações',
};
export const ESTADO = { pendente: 'Pendente', em_desenvolvimento: 'Em desenvolvimento', concluido: 'Concluído' };
export const CAT_AVISO = { geral: 'Geral', treinos: 'Treinos', campeonatos: 'Campeonatos', graduacoes: 'Graduações', eventos: 'Eventos', uniformes: 'Uniformes', alteracoes: 'Alterações', instituto: 'Instituto' };
export const CAT_EVENTO = { treino: 'Treino', exame: 'Exame', campeonato: 'Campeonato', reuniao: 'Reunião', apresentacao: 'Apresentação', social: 'Evento social', comemorativa: 'Data comemorativa' };
export const PUBLICO = { todos: 'Todos', kids: 'Turma Kids', livre: 'Turma Livre', professores: 'Só professores' };
export const CAT_CONQUISTA = { medalha: 'Medalha', campeonato: 'Campeonato', participacao: 'Participação', colocacao: 'Colocação', evolucao: 'Evolução', superacao: 'Superação', reconhecimento: 'Reconhecimento', disciplina: 'Disciplina', especial: 'Conquista especial' };
export const TIPO_CERT = { participacao: 'Participação', campeonato: 'Campeonato', graduacao: 'Graduação', reconhecimento: 'Reconhecimento' };
export const CAT_EQUIP = { luvas: 'Luvas', protetores: 'Protetores', escudos: 'Escudos', materiais: 'Materiais de treino', uniformes: 'Uniformes', outros: 'Outros' };
export const EST_EQUIP = { novo: 'Novo', bom: 'Bom', regular: 'Regular', precisa_reparo: 'Precisa de reparo' };
