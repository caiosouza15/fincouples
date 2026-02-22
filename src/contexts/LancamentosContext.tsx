import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Lancamento, Categoria } from '@/types';
import {
  getLancamentos,
  createLancamento,
  updateLancamento,
  deleteLancamento,
} from '@/services/lancamentosService';

interface LancamentosContextType {
  lancamentos: Lancamento[];
  loading: boolean;
  error: string | null;
  fetchLancamentos: () => Promise<void>;
  addLancamento: (lancamento: Omit<Lancamento, 'id'>) => Promise<Lancamento>;
  editLancamento: (id: string, lancamento: Partial<Lancamento>) => Promise<void>;
  removeLancamento: (id: string) => Promise<void>;
  getLancamentosPorMes: (mes: string) => Lancamento[];
  getReceitaMensal: (mes?: string) => number;
  getDespesaMensal: (mes?: string) => number;
  getResultadoMensal: (mes?: string) => number;
  getMaioresGastos: (categorias: Categoria[], limit?: number, mes?: string) => Array<{ categoriaId: string; categoria: Categoria; valor: number }>;
  getReceitasPorCategoria: (categorias: Categoria[], limit?: number, mes?: string) => Array<{ categoriaId: string; categoria: Categoria; valor: number }>;
  getMaioresDespesasPorValor: (mes?: string, limit?: number) => Lancamento[];
  getDespesasPorFormaPagamento: (mes?: string) => { conta: number; cartao: number; outros: number };
  getSaldoDisponivelMes: (saldoAtualContas: number, mes?: string) => number;
  getUltimosGastos: (mes?: string, limit?: number) => Lancamento[];
}

const LancamentosContext = createContext<LancamentosContextType | undefined>(undefined);

export function LancamentosProvider({ children }: { children: ReactNode }) {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLancamentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLancamentos();
      
      // Debug: verificar dados carregados
      console.log('📊 [LancamentosContext] Lançamentos carregados:', data.length);
      if (data.length > 0) {
        // Verificar formato de datas
        const firstLancamento = data[0];
        console.log('📅 [LancamentosContext] Primeiro lançamento:', {
          id: firstLancamento.id,
          data: firstLancamento.data,
          dataType: typeof firstLancamento.data,
          isDate: firstLancamento.data instanceof Date,
          dataString: firstLancamento.data.toString(),
        });
        
        // Verificar meses disponíveis
        const meses = new Set<string>();
        data.forEach(l => {
          const year = l.data.getFullYear();
          const month = String(l.data.getMonth() + 1).padStart(2, '0');
          meses.add(`${year}-${month}`);
        });
        console.log('📆 [LancamentosContext] Meses disponíveis nos dados:', Array.from(meses).sort());
        
        // Verificar mês atual
        const currentMonth = getCurrentMonth();
        console.log('🗓️ [LancamentosContext] Mês atual sendo usado:', currentMonth);
        
        // Verificar lançamentos do mês atual
        const lancamentosMesAtual = getLancamentosPorMesContext(currentMonth);
        console.log('💰 [LancamentosContext] Lançamentos do mês atual:', lancamentosMesAtual.length);
        console.log('💵 [LancamentosContext] Receita do mês atual:', getReceitaMensalContext());
        console.log('💸 [LancamentosContext] Despesa do mês atual:', getDespesaMensalContext());
      } else {
        console.warn('⚠️ [LancamentosContext] Nenhum lançamento encontrado no localStorage');
      }
      
      setLancamentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar lançamentos');
      console.error('❌ [LancamentosContext] Erro ao buscar lançamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLancamento = async (lancamento: Omit<Lancamento, 'id'>): Promise<Lancamento> => {
    try {
      setLoading(true);
      setError(null);
      const newLancamento = await createLancamento(lancamento);
      setLancamentos((prev) => [newLancamento, ...prev].sort((a, b) => {
        const aT = a.data instanceof Date ? a.data.getTime() : new Date(a.data).getTime();
        const bT = b.data instanceof Date ? b.data.getTime() : new Date(b.data).getTime();
        return bT - aT;
      }));
      return newLancamento;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lançamento');
      console.error('Erro ao criar lançamento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editLancamento = async (id: string, lancamento: Partial<Lancamento>) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateLancamento(id, lancamento);
      setLancamentos((prev) =>
        prev
          .map((l) => (l.id === id ? updated : l))
          .sort((a, b) => b.data.getTime() - a.data.getTime())
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lançamento');
      console.error('Erro ao atualizar lançamento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeLancamento = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteLancamento(id);
      setLancamentos((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir lançamento');
      console.error('Erro ao excluir lançamento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função helper para formatar mês (YYYY-MM)
  const formatMonth = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Obter mês atual se não especificado
  const getCurrentMonth = (): string => {
    return formatMonth(new Date());
  };

  // Filtrar lançamentos por mês
  const getLancamentosPorMesContext = (mes: string): Lancamento[] => {
    return lancamentos.filter((l) => formatMonth(l.data) === mes);
  };

  // Calcular receita mensal
  const getReceitaMensalContext = (mes?: string): number => {
    const targetMonth = mes || getCurrentMonth();
    const lancamentosMes = getLancamentosPorMesContext(targetMonth);
    return lancamentosMes
      .filter((l) => l.tipo === 'receita')
      .reduce((sum, l) => sum + l.valor, 0);
  };

  // Calcular despesa mensal
  const getDespesaMensalContext = (mes?: string): number => {
    const targetMonth = mes || getCurrentMonth();
    const lancamentosMes = getLancamentosPorMesContext(targetMonth);
    return lancamentosMes
      .filter((l) => l.tipo === 'despesa')
      .reduce((sum, l) => sum + l.valor, 0);
  };

  // Calcular resultado mensal (receita - despesa)
  const getResultadoMensalContext = (mes?: string): number => {
    return getReceitaMensalContext(mes) - getDespesaMensalContext(mes);
  };

  // Calcular saldo disponível acumulado até o mês selecionado
  const getSaldoDisponivelMesContext = (saldoAtualContas: number, mes?: string): number => {
    const targetMonth = mes || getCurrentMonth();
    
    // Calcular saldo inicial: saldo atual - todos os lançamentos
    const todasReceitas = lancamentos
      .filter((l) => l.tipo === 'receita')
      .reduce((sum, l) => sum + l.valor, 0);
    
    const todasDespesas = lancamentos
      .filter((l) => l.tipo === 'despesa')
      .reduce((sum, l) => sum + l.valor, 0);
    
    // Saldo inicial = saldo atual - (receitas totais - despesas totais)
    const saldoInicial = saldoAtualContas - (todasReceitas - todasDespesas);
    
    // Calcular receitas e despesas até o mês selecionado (inclusive)
    const receitasAteMes = lancamentos
      .filter((l) => {
        const lancamentoMonth = formatMonth(l.data);
        return l.tipo === 'receita' && lancamentoMonth <= targetMonth;
      })
      .reduce((sum, l) => sum + l.valor, 0);
    
    const despesasAteMes = lancamentos
      .filter((l) => {
        const lancamentoMonth = formatMonth(l.data);
        return l.tipo === 'despesa' && lancamentoMonth <= targetMonth;
      })
      .reduce((sum, l) => sum + l.valor, 0);
    
    // Saldo disponível = saldo inicial + receitas até o mês - despesas até o mês
    return saldoInicial + receitasAteMes - despesasAteMes;
  };

  // Obter maiores gastos por categoria
  const getMaioresGastosContext = (
    categorias: Categoria[],
    limit: number = 5,
    mes?: string
  ): Array<{ categoriaId: string; categoria: Categoria; valor: number }> => {
    // Filtrar despesas pelo mês se fornecido
    let despesas = lancamentos.filter((l) => l.tipo === 'despesa');
    
    if (mes) {
      const targetMonth = mes;
      despesas = despesas.filter((l) => formatMonth(l.data) === targetMonth);
    }
    
    // Agrupar por categoria e somar valores
    const gastosPorCategoria = new Map<string, number>();
    
    despesas.forEach((despesa) => {
      const atual = gastosPorCategoria.get(despesa.categoriaId) || 0;
      gastosPorCategoria.set(despesa.categoriaId, atual + despesa.valor);
    });

    // Converter para array e ordenar
    const maioresGastos = Array.from(gastosPorCategoria.entries())
      .map(([categoriaId, valor]) => {
        const categoria = categorias.find((c) => c.id === categoriaId);
        return {
          categoriaId,
          categoria: categoria || { id: categoriaId, nome: 'Desconhecida', tipo: 'despesa' as const },
          valor,
        };
      })
      .sort((a, b) => b.valor - a.valor)
      .slice(0, limit);

    return maioresGastos;
  };

  // Obter receitas por categoria (espelho de getMaioresGastos para receita)
  const getReceitasPorCategoriaContext = (
    categorias: Categoria[],
    limit: number = 5,
    mes?: string
  ): Array<{ categoriaId: string; categoria: Categoria; valor: number }> => {
    let receitas = lancamentos.filter((l) => l.tipo === 'receita');
    if (mes) {
      receitas = receitas.filter((l) => formatMonth(l.data) === mes);
    }
    const porCategoria = new Map<string, number>();
    receitas.forEach((r) => {
      const atual = porCategoria.get(r.categoriaId) || 0;
      porCategoria.set(r.categoriaId, atual + r.valor);
    });
    return Array.from(porCategoria.entries())
      .map(([categoriaId, valor]) => {
        const categoria = categorias.find((c) => c.id === categoriaId);
        return {
          categoriaId,
          categoria: categoria || { id: categoriaId, nome: 'Desconhecida', tipo: 'receita' as const },
          valor,
        };
      })
      .sort((a, b) => b.valor - a.valor)
      .slice(0, limit);
  };

  // Obter maiores despesas do mês por valor (lançamentos ordenados por valor desc)
  const getMaioresDespesasPorValorContext = (mes?: string, limit: number = 5): Lancamento[] => {
    const targetMonth = mes || getCurrentMonth();
    return lancamentos
      .filter((l) => l.tipo === 'despesa' && formatMonth(l.data) === targetMonth)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, limit);
  };

  // Obter despesas do mês agrupadas por forma de pagamento (conta vs cartão)
  const getDespesasPorFormaPagamentoContext = (mes?: string): { conta: number; cartao: number; outros: number } => {
    const targetMonth = mes || getCurrentMonth();
    const despesas = lancamentos.filter(
      (l) => l.tipo === 'despesa' && formatMonth(l.data) === targetMonth
    );
    let conta = 0;
    let cartao = 0;
    let outros = 0;
    despesas.forEach((l) => {
      if (l.cartaoId) cartao += l.valor;
      else if (l.contaId) conta += l.valor;
      else outros += l.valor;
    });
    return { conta, cartao, outros };
  };

  // Obter últimos gastos (5 despesas mais recentes do mês, excluindo datas futuras)
  const getUltimosGastosContext = (mes?: string, limit: number = 5): Lancamento[] => {
    const targetMonth = mes || getCurrentMonth();
    const hojeStr = new Date().toISOString().split('T')[0];
    return lancamentos
      .filter((l) => {
        if (l.tipo !== 'despesa') return false;
        const dataL = l.data instanceof Date ? l.data : new Date(l.data);
        if (formatMonth(dataL) !== targetMonth) return false;
        const dataStr = dataL.toISOString().split('T')[0];
        return dataStr <= hojeStr;
      })
      .sort((a, b) => {
        const aTime = a.data instanceof Date ? a.data.getTime() : new Date(a.data).getTime();
        const bTime = b.data instanceof Date ? b.data.getTime() : new Date(b.data).getTime();
        return bTime - aTime;
      })
      .slice(0, limit);
  };

  // Carregar dados na inicialização
  useEffect(() => {
    // Pequeno delay para garantir que o seed terminou (se executou)
    const timer = setTimeout(() => {
      fetchLancamentos();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const value: LancamentosContextType = {
    lancamentos,
    loading,
    error,
    fetchLancamentos,
    addLancamento,
    editLancamento,
    removeLancamento,
    getLancamentosPorMes: getLancamentosPorMesContext,
    getReceitaMensal: getReceitaMensalContext,
    getDespesaMensal: getDespesaMensalContext,
    getResultadoMensal: getResultadoMensalContext,
    getMaioresGastos: getMaioresGastosContext,
    getReceitasPorCategoria: getReceitasPorCategoriaContext,
    getMaioresDespesasPorValor: getMaioresDespesasPorValorContext,
    getDespesasPorFormaPagamento: getDespesasPorFormaPagamentoContext,
    getSaldoDisponivelMes: getSaldoDisponivelMesContext,
    getUltimosGastos: getUltimosGastosContext,
  };

  return <LancamentosContext.Provider value={value}>{children}</LancamentosContext.Provider>;
}

export function useLancamentos() {
  const context = useContext(LancamentosContext);
  if (context === undefined) {
    throw new Error('useLancamentos deve ser usado dentro de um LancamentosProvider');
  }
  return context;
}
