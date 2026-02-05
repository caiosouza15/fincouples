import type { FaturaCartao, CartaoCredito } from '@/types';
import { getLancamentos } from './lancamentosService';
import { getCartoes } from './cartoesService';

const STORAGE_KEY = 'fincouples_faturas';

function loadFromStorage(): FaturaCartao[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    // Converter datas de string para Date
    return parsed.map(fatura => ({
      ...fatura,
      dataFechamento: new Date(fatura.dataFechamento),
      dataVencimento: new Date(fatura.dataVencimento),
    }));
  } catch {
    return [];
  }
}

function saveToStorage(faturas: FaturaCartao[]): void {
  try {
    // Garantir que todas as datas sejam convertidas para ISO string
    const faturasToSave = faturas.map(f => ({
      ...f,
      dataFechamento: f.dataFechamento instanceof Date ? f.dataFechamento.toISOString() : f.dataFechamento,
      dataVencimento: f.dataVencimento instanceof Date ? f.dataVencimento.toISOString() : f.dataVencimento,
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faturasToSave));
  } catch (error) {
    console.error('Erro ao salvar faturas no localStorage:', error);
  }
}

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
  const cartao = cartoes.find(c => c.id === cartaoId);
  
  if (!cartao) {
    throw new Error('Cartão não encontrado');
  }
  
  // Verificar se já existe fatura para este mês
  const faturas = loadFromStorage();
  const faturaExistente = faturas.find(
    f => f.cartaoId === cartaoId && f.mesReferencia === mesReferencia
  );
  
  if (faturaExistente) {
    // Recalcular valor total
    const valorTotal = await calcularFaturaMensal(cartaoId, mesReferencia);
    const valorPago = faturaExistente.valorPago;
    
    // Atualizar status
    let status: 'nao_pago' | 'pago_parcial' | 'pago_total';
    if (valorPago === 0) {
      status = 'nao_pago';
    } else if (valorPago >= valorTotal) {
      status = 'pago_total';
    } else {
      status = 'pago_parcial';
    }
    
    const faturaAtualizada: FaturaCartao = {
      ...faturaExistente,
      valorTotal,
      status,
      pago: status === 'pago_total',
    };
    
    const index = faturas.findIndex(f => f.id === faturaExistente.id);
    faturas[index] = faturaAtualizada;
    saveToStorage(faturas);
    
    return faturaAtualizada;
  }
  
  // Calcular período e datas
  const { fim } = calcularPeriodoFatura(cartao, mesReferencia);
  const valorTotal = await calcularFaturaMensal(cartaoId, mesReferencia);
  
  // Calcular data de vencimento (dia de vencimento do mês de referência)
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const dataVencimento = new Date(ano, mes - 1, cartao.vencimento);
  
  // Criar nova fatura
  const novaFatura: FaturaCartao = {
    id: crypto.randomUUID(),
    cartaoId,
    mesReferencia,
    valorTotal,
    valorPago: 0,
    status: 'nao_pago',
    dataFechamento: fim,
    dataVencimento,
    pago: false,
  };
  
  faturas.push(novaFatura);
  saveToStorage(faturas);
  
  return novaFatura;
}

export async function getFaturas(): Promise<FaturaCartao[]> {
  return loadFromStorage();
}

export async function getFaturasPorCartao(cartaoId: string): Promise<FaturaCartao[]> {
  const faturas = loadFromStorage();
  return faturas.filter(f => f.cartaoId === cartaoId);
}

export async function getFaturaPorMes(
  cartaoId: string,
  mesReferencia: string
): Promise<FaturaCartao | null> {
  const faturas = loadFromStorage();
  return faturas.find(
    f => f.cartaoId === cartaoId && f.mesReferencia === mesReferencia
  ) || null;
}

export async function createFatura(fatura: Omit<FaturaCartao, 'id'>): Promise<FaturaCartao> {
  const faturas = loadFromStorage();
  const novaFatura: FaturaCartao = {
    ...fatura,
    id: crypto.randomUUID(),
  };
  faturas.push(novaFatura);
  saveToStorage(faturas);
  return novaFatura;
}

export async function updateFatura(
  id: string,
  fatura: Partial<FaturaCartao>
): Promise<FaturaCartao> {
  const faturas = loadFromStorage();
  const index = faturas.findIndex(f => f.id === id);
  
  if (index === -1) {
    throw new Error('Fatura não encontrada');
  }
  
  // Atualizar status baseado em valorPago e valorTotal
  const faturaAtual = faturas[index];
  const valorPago = fatura.valorPago !== undefined ? fatura.valorPago : faturaAtual.valorPago;
  const valorTotal = fatura.valorTotal !== undefined ? fatura.valorTotal : faturaAtual.valorTotal;
  
  let status: 'nao_pago' | 'pago_parcial' | 'pago_total';
  if (valorPago === 0) {
    status = 'nao_pago';
  } else if (valorPago >= valorTotal) {
    status = 'pago_total';
  } else {
    status = 'pago_parcial';
  }
  
  faturas[index] = {
    ...faturas[index],
    ...fatura,
    status,
    pago: status === 'pago_total',
  };
  
  saveToStorage(faturas);
  return faturas[index];
}

export async function deleteFatura(id: string): Promise<void> {
  const faturas = loadFromStorage();
  const index = faturas.findIndex(f => f.id === id);
  
  if (index === -1) {
    throw new Error('Fatura não encontrada');
  }
  
  faturas.splice(index, 1);
  saveToStorage(faturas);
}
