// Funcao de compatibilidade para migrar emojis antigos para nomes de icones Lucide
// Mapeamento de emojis para nomes de icones

const emojiToIconMap: Record<string, string> = {
  // Navegacao
  '📊': 'dashboard',
  '💰': 'lancamentos',
  '📈': 'relatorios',
  '🎯': 'metas',
  '⚙️': 'configuracoes',
  // Contas
  '🏦': 'conta-corrente',
  '📈': 'investimento',
  // Categorias
  '🏠': 'moradia',
  '🍽️': 'alimentacao',
  '🚗': 'transporte',
  '💊': 'saude',
  '🎓': 'educacao',
  '🛒': 'compras',
  '🎮': 'lazer',
  '👕': 'roupas',
  '📱': 'assinaturas',
  '💼': 'salario',
  '💵': 'outras-receitas',
  '🎁': 'presentes',
  '📋': 'despesa-padrao',
};

/**
 * Converte um emoji antigo para o nome do icone Lucide correspondente
 * Retorna o valor original se nao for um emoji conhecido
 */
export function migrateEmojiToIconName(value: string | undefined): string | undefined {
  if (!value) return value;
  
  // Se ja for um nome de icone (nao contem emoji), retorna como esta
  if (!/[^\x00-\x7F]/.test(value)) {
    return value;
  }
  
  // Tenta encontrar o emoji no mapa
  return emojiToIconMap[value] || value;
}
