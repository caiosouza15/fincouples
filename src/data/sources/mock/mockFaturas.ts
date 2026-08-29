import type { FaturaCartao } from '@/types';
import type { FaturasDataSource } from '@/data/contracts';

const STORAGE_KEY = 'fincouples_faturas';

function loadFromStorage(): FaturaCartao[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((f: FaturaCartao) => ({
      ...f,
      dataFechamento: new Date(f.dataFechamento),
      dataVencimento: new Date(f.dataVencimento),
    }));
  } catch {
    return [];
  }
}

function saveToStorage(faturas: FaturaCartao[]): void {
  try {
    const toSave = faturas.map((f) => ({
      ...f,
      dataFechamento: f.dataFechamento instanceof Date ? f.dataFechamento.toISOString() : f.dataFechamento,
      dataVencimento: f.dataVencimento instanceof Date ? f.dataVencimento.toISOString() : f.dataVencimento,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    console.error('Erro ao salvar faturas no localStorage');
  }
}

export const mockFaturas: FaturasDataSource = {
  async getFaturas() {
    return loadFromStorage();
  },
  async getFaturasPorCartao(cartaoId) {
    const faturas = loadFromStorage();
    return faturas.filter((f) => f.cartaoId === cartaoId);
  },
  async getFaturaPorMes(cartaoId, mesReferencia) {
    const faturas = loadFromStorage();
    const found = faturas.find((f) => f.cartaoId === cartaoId && f.mesReferencia === mesReferencia);
    return found || null;
  },
  async createFatura(fatura) {
    const faturas = loadFromStorage();
    const novaFatura = { ...fatura, id: crypto.randomUUID() };
    faturas.push(novaFatura);
    saveToStorage(faturas);
    return novaFatura;
  },
  async updateFatura(id, fatura) {
    const faturas = loadFromStorage();
    const index = faturas.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Fatura não encontrada');
    const faturaAtual = faturas[index];
    const valorPago = fatura.valorPago !== undefined ? fatura.valorPago : faturaAtual.valorPago;
    const valorTotal = fatura.valorTotal !== undefined ? fatura.valorTotal : faturaAtual.valorTotal;
    let status: 'nao_pago' | 'pago_parcial' | 'pago_total';
    if (valorPago === 0) status = 'nao_pago';
    else if (valorPago >= valorTotal) status = 'pago_total';
    else status = 'pago_parcial';
    faturas[index] = { ...faturas[index], ...fatura, status, pago: status === 'pago_total' };
    saveToStorage(faturas);
    return faturas[index];
  },
  async deleteFatura(id) {
    const faturas = loadFromStorage();
    const index = faturas.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Fatura não encontrada');
    faturas.splice(index, 1);
    saveToStorage(faturas);
  },
};
