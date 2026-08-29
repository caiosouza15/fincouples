import type { Lancamento } from '@/types';
import type { LancamentosDataSource } from '@/data/contracts';

const STORAGE_KEY = 'fincouples_lancamentos';

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function loadFromStorage(): Lancamento[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((l: Lancamento) => ({
      ...l,
      data: l.data instanceof Date ? l.data : new Date(l.data),
    }));
  } catch {
    return [];
  }
}

function saveToStorage(lancamentos: Lancamento[]): void {
  try {
    const toSave = lancamentos.map((l) => ({
      ...l,
      data: l.data instanceof Date ? l.data : new Date(l.data),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    console.error('Erro ao salvar lançamentos no localStorage');
  }
}

export const mockLancamentos: LancamentosDataSource = {
  async getLancamentos() {
    const lancamentos = loadFromStorage();
    return lancamentos.sort((a, b) => b.data.getTime() - a.data.getTime());
  },
  async createLancamento(lancamento) {
    if (lancamento.valor <= 0) throw new Error('Valor deve ser maior que zero');
    if (!lancamento.categoriaId) throw new Error('Categoria é obrigatória');
    if (!lancamento.contaId && !lancamento.cartaoId) throw new Error('Conta ou cartão deve ser informado');
    if (!(lancamento.data instanceof Date) || isNaN(lancamento.data.getTime())) throw new Error('Data inválida');
    const lancamentos = loadFromStorage();
    const newLancamento = { ...lancamento, id: crypto.randomUUID(), casalId: lancamento.casalId || 'casal-1' };
    lancamentos.push(newLancamento);
    saveToStorage(lancamentos);
    return newLancamento;
  },
  async updateLancamento(id, lancamento) {
    const lancamentos = loadFromStorage();
    const index = lancamentos.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lançamento não encontrado');
    if (lancamento.valor !== undefined && lancamento.valor <= 0) throw new Error('Valor deve ser maior que zero');
    if (lancamento.data && typeof lancamento.data === 'string') {
      lancamento.data = new Date(lancamento.data);
    }
    lancamentos[index] = { ...lancamentos[index], ...lancamento };
    saveToStorage(lancamentos);
    return lancamentos[index];
  },
  async deleteLancamento(id) {
    const lancamentos = loadFromStorage();
    const index = lancamentos.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lançamento não encontrado');
    lancamentos.splice(index, 1);
    saveToStorage(lancamentos);
  },
  async getLancamentosPorMes(mes) {
    const lancamentos = loadFromStorage();
    return lancamentos.filter((l) => formatMonth(l.data) === mes);
  },
};
