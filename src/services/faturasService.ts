import type { FaturaCartao, CartaoCredito } from '@/types';
import { getLancamentos } from './lancamentosService';
import { getCartoes } from './cartoesService';
import { getDataSource } from '@/data/config';

const ds = () => getDataSource().faturas;

// Função helper para calcular período da fatura baseado na data de fechamento
function calcularPeriodoFatura(cartao: CartaoCredito, mesReferencia: string): { inicio: Date; fim: Date } {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  
  // Data de fechamento do mês atual
  const dataFechamento = new Date(ano, mes - 1, cartao.fechamento);
  
  // Data de início: fechamento do mês anterior
  const dataInicio = new Date(ano, mes - 2, cartao.fechamento);
  
  // Data de fim: fechamento do mês atual (exclusivo, então -1 dia)
  const dataFim = new Date(dataFechamento);
  dataFim.setDate(dataFim.getDate() - 1);
  
  return { inicio: dataInicio, fim: dataFim };
}

// Função para calcular valor total da fatura baseado nos lançamentos
export async function calcularFaturaMensal(
  cartaoId: string,
  mesReferencia: string
): Promise<number> {
  const cartoes = await getCartoes();
  const cartao = cartoes.find(c => c.id === cartaoId);
  
  if (!cartao) {
    throw new Error('Cartão não encontrado');
  }
  
  const { inicio, fim } = calcularPeriodoFatura(cartao, mesReferencia);
  const lancamentos = await getLancamentos();
  
  // Filtrar lançamentos do cartão no período
  const lancamentosFatura = lancamentos.filter(l => {
    if (l.cartaoId !== cartaoId) return false;
    if (l.tipo !== 'despesa') return false;
    
    const dataLancamento = l.data instanceof Date ? l.data : new Date(l.data);
    return dataLancamento >= inicio && dataLancamento <= fim;
  });
  
  // Somar valores
  return lancamentosFatura.reduce((total, l) => total + l.valor, 0);
}

// Função para gerar fatura automaticamente
export async function gerarFaturaAutomatica(
  cartaoId: string,
  mesReferencia: string
): Promise<FaturaCartao> {
  const cartoes = await getCartoes();
  const cartao = cartoes.find((c) => c.id === cartaoId);
  if (!cartao) throw new Error('Cartão não encontrado');

  const faturaExistente = await ds().getFaturaPorMes(cartaoId, mesReferencia);
  const valorTotal = await calcularFaturaMensal(cartaoId, mesReferencia);

  if (faturaExistente) {
    const valorPago = faturaExistente.valorPago;
    let status: 'nao_pago' | 'pago_parcial' | 'pago_total';
    if (valorPago === 0) status = 'nao_pago';
    else if (valorPago >= valorTotal) status = 'pago_total';
    else status = 'pago_parcial';
    return ds().updateFatura(faturaExistente.id, { valorTotal, status, pago: status === 'pago_total' });
  }

  const { fim } = calcularPeriodoFatura(cartao, mesReferencia);
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const dataVencimento = new Date(ano, mes - 1, cartao.vencimento);
  return ds().createFatura({
    cartaoId,
    mesReferencia,
    valorTotal,
    valorPago: 0,
    status: 'nao_pago',
    dataFechamento: fim,
    dataVencimento,
    pago: false,
  });
}

export async function getFaturas(): Promise<FaturaCartao[]> {
  return ds().getFaturas();
}
export async function getFaturasPorCartao(cartaoId: string): Promise<FaturaCartao[]> {
  return ds().getFaturasPorCartao(cartaoId);
}
export async function getFaturaPorMes(cartaoId: string, mesReferencia: string): Promise<FaturaCartao | null> {
  return ds().getFaturaPorMes(cartaoId, mesReferencia);
}
export async function createFatura(fatura: Omit<FaturaCartao, 'id'>): Promise<FaturaCartao> {
  return ds().createFatura(fatura);
}
export async function updateFatura(id: string, fatura: Partial<FaturaCartao>): Promise<FaturaCartao> {
  return ds().updateFatura(id, fatura);
}
export async function deleteFatura(id: string): Promise<void> {
  return ds().deleteFatura(id);
}
