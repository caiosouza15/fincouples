import type { MetaFinanceira } from '@/types';
import type { MetasDataSource } from '@/data/contracts';

const STORAGE_KEY = 'fincouples_metas';

function loadFromStorage(): MetaFinanceira[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: MetaFinanceira) => ({
      ...m,
      prazo: m.prazo ? new Date(m.prazo) : undefined,
    }));
  } catch {
    return [];
  }
}

function saveToStorage(metas: MetaFinanceira[]): void {
  try {
    const toSave = metas.map((m) => ({
      ...m,
      prazo: m.prazo instanceof Date ? m.prazo.toISOString() : m.prazo,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    console.error('Erro ao salvar metas no localStorage');
  }
}

export const mockMetas: MetasDataSource = {
  async getMetas() {
    return loadFromStorage();
  },
  async createMeta(meta) {
    const metas = loadFromStorage();
    const newMeta: MetaFinanceira = {
      ...meta,
      id: crypto.randomUUID(),
      casalId: meta.casalId || 'casal-1',
    };
    metas.push(newMeta);
    saveToStorage(metas);
    return newMeta;
  },
  async updateMeta(id, meta) {
    const metas = loadFromStorage();
    const index = metas.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Meta não encontrada');
    metas[index] = { ...metas[index], ...meta };
    saveToStorage(metas);
    return metas[index];
  },
  async deleteMeta(id) {
    const metas = loadFromStorage();
    const index = metas.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Meta não encontrada');
    metas.splice(index, 1);
    saveToStorage(metas);
  },
};
