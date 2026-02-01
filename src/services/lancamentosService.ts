import type { Lancamento } from '@/types';

const STORAGE_KEY = 'fincouples_lancamentos';

function loadFromStorage(): Lancamento[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log('🔍 [lancamentosService] Nenhum dado encontrado no localStorage');
      return [];
    }
    
    const parsed = JSON.parse(data);
    
    // Validar se é array
    if (!Array.isArray(parsed)) {
      console.warn('⚠️ [lancamentosService] Dados corrompidos no localStorage, resetando...');
      return [];
    }
    
    console.log('🔍 [lancamentosService] Dados brutos do localStorage:', parsed.length, 'itens');
    if (parsed.length > 0) {
      console.log('🔍 [lancamentosService] Primeiro item bruto:', {
        id: parsed[0].id,
        data: parsed[0].data,
        dataType: typeof parsed[0].data,
      });
    }
    
    // Converter datas de string para Date
    const lancamentos = parsed.map(lancamento => {
      let dataDate: Date;
      
      // Se já for um objeto Date (não deveria acontecer, mas por segurança)
      if (lancamento.data instanceof Date) {
        dataDate = lancamento.data;
      } 
      // Se for string ISO ou timestamp
      else if (typeof lancamento.data === 'string') {
        dataDate = new Date(lancamento.data);
      }
      // Se for número (timestamp)
      else if (typeof lancamento.data === 'number') {
        dataDate = new Date(lancamento.data);
      }
      // Fallback
      else {
        dataDate = new Date(lancamento.data);
      }
      
      // Validar se a data é válida
      if (isNaN(dataDate.getTime())) {
        console.warn(`⚠️ [lancamentosService] Data inválida para lançamento ${lancamento.id}, usando data atual`);
        dataDate = new Date();
      }
      
      return {
        ...lancamento,
        data: dataDate,
      };
    });
    
    console.log('🔍 [lancamentosService] Lançamentos convertidos:', lancamentos.length);
    if (lancamentos.length > 0) {
      const meses = new Set<string>();
      lancamentos.forEach(l => {
        const year = l.data.getFullYear();
        const month = String(l.data.getMonth() + 1).padStart(2, '0');
        meses.add(`${year}-${month}`);
      });
      console.log('🔍 [lancamentosService] Meses nos dados convertidos:', Array.from(meses).sort());
    }
    
    return lancamentos;
  } catch (error) {
    console.error('❌ [lancamentosService] Erro ao carregar lançamentos do localStorage:', error);
    return [];
  }
}

function saveToStorage(lancamentos: Lancamento[]): void {
  try {
    // Garantir que todas as datas sejam objetos Date válidos antes de salvar
    const lancamentosToSave = lancamentos.map(l => ({
      ...l,
      data: l.data instanceof Date ? l.data : new Date(l.data),
    }));
    
    // JSON.stringify automaticamente converte Date para string ISO
    const jsonData = JSON.stringify(lancamentosToSave);
    localStorage.setItem(STORAGE_KEY, jsonData);
    
    console.log('💾 [lancamentosService] Dados salvos no localStorage:', lancamentosToSave.length, 'lançamentos');
    if (lancamentosToSave.length > 0) {
      console.log('💾 [lancamentosService] Primeira data sendo salva:', {
        original: lancamentosToSave[0].data,
        stringified: JSON.stringify(lancamentosToSave[0].data),
      });
    }
  } catch (error) {
    console.error('❌ [lancamentosService] Erro ao salvar lançamentos no localStorage:', error);
  }
}

// Função helper para formatar mês (YYYY-MM)
function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export async function getLancamentos(): Promise<Lancamento[]> {
  const lancamentos = loadFromStorage();
  
  // Debug: verificar dados carregados
  console.log('🔍 [lancamentosService] Total de lançamentos carregados:', lancamentos.length);
  if (lancamentos.length > 0) {
    const first = lancamentos[0];
    console.log('🔍 [lancamentosService] Primeiro lançamento:', {
      id: first.id,
      data: first.data,
      dataType: typeof first.data,
      isDate: first.data instanceof Date,
    });
  }
  
  // Ordenar por data (mais recente primeiro)
  return lancamentos.sort((a, b) => b.data.getTime() - a.data.getTime());
}

export async function createLancamento(
  lancamento: Omit<Lancamento, 'id'>
): Promise<Lancamento> {
  // Validações
  if (lancamento.valor <= 0) {
    throw new Error('Valor deve ser maior que zero');
  }

  if (!lancamento.categoriaId) {
    throw new Error('Categoria é obrigatória');
  }

  if (!lancamento.contaId && !lancamento.cartaoId) {
    throw new Error('Conta ou cartão deve ser informado');
  }

  if (!(lancamento.data instanceof Date) || isNaN(lancamento.data.getTime())) {
    throw new Error('Data inválida');
  }

  const lancamentos = loadFromStorage();
  const newLancamento: Lancamento = {
    ...lancamento,
    id: crypto.randomUUID(),
    casalId: lancamento.casalId || 'casal-1',
  };

  lancamentos.push(newLancamento);
  saveToStorage(lancamentos);
  return newLancamento;
}

export async function updateLancamento(
  id: string,
  lancamento: Partial<Lancamento>
): Promise<Lancamento> {
  const lancamentos = loadFromStorage();
  const index = lancamentos.findIndex((l) => l.id === id);

  if (index === -1) {
    throw new Error('Lançamento não encontrado');
  }

  // Validações se estiver atualizando valor
  if (lancamento.valor !== undefined && lancamento.valor <= 0) {
    throw new Error('Valor deve ser maior que zero');
  }

  // Converter data se for string
  if (lancamento.data && typeof lancamento.data === 'string') {
    lancamento.data = new Date(lancamento.data);
  }

  lancamentos[index] = {
    ...lancamentos[index],
    ...lancamento,
  };

  saveToStorage(lancamentos);
  return lancamentos[index];
}

export async function deleteLancamento(id: string): Promise<void> {
  const lancamentos = loadFromStorage();
  const index = lancamentos.findIndex((l) => l.id === id);

  if (index === -1) {
    throw new Error('Lançamento não encontrado');
  }

  lancamentos.splice(index, 1);
  saveToStorage(lancamentos);
}

export async function getLancamentosPorMes(mes: string): Promise<Lancamento[]> {
  const lancamentos = loadFromStorage();
  return lancamentos.filter((l) => formatMonth(l.data) === mes);
}

export async function getLancamentosPorTipo(
  tipo: 'receita' | 'despesa'
): Promise<Lancamento[]> {
  const lancamentos = loadFromStorage();
  return lancamentos.filter((l) => l.tipo === tipo);
}
