import type { Lancamento } from '@/types';
import { getDataSource } from '@/data/config';

const ds = () => getDataSource().lancamentos;

export async function getLancamentos(): Promise<Lancamento[]> {
  return ds().getLancamentos();
}
export async function createLancamento(lancamento: Omit<Lancamento, 'id'>): Promise<Lancamento> {
  return ds().createLancamento(lancamento);
}
export async function updateLancamento(id: string, lancamento: Partial<Lancamento>): Promise<Lancamento> {
  return ds().updateLancamento(id, lancamento);
}
export async function deleteLancamento(id: string): Promise<void> {
  return ds().deleteLancamento(id);
}
export async function getLancamentosPorMes(mes: string): Promise<Lancamento[]> {
  return ds().getLancamentosPorMes(mes);
}

export async function getLancamentosPorTipo(tipo: 'receita' | 'despesa'): Promise<Lancamento[]> {
  const lancamentos = await ds().getLancamentos();
  return lancamentos.filter((l) => l.tipo === tipo);
}
