import { useMemo } from 'react';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useFaturas } from '@/hooks/useFaturas';
import { useCartoes } from '@/hooks/useCartoes';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';

export interface FaturaPrevisao {
  dia: number;
  valor: number;
  nomeCartao: string;
}

export function useVencimentosPrevisoes(): {
  despesasPorDia: Record<number, number>;
  faturasDoMes: FaturaPrevisao[];
  ultimoDiaDoMes: number;
  acumuladoAteDia: number[];
  hasData: boolean;
} {
  const { selectedMonth } = useSelectedMonth();
  const { getLancamentosPorMes } = useLancamentos();
  const { faturas } = useFaturas();
  const { getCartaoById } = useCartoes();

  return useMemo(() => {
    const [ano, mes] = selectedMonth.split('-').map(Number);
    const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();

    const lancamentos = getLancamentosPorMes(selectedMonth);
    const despesas = lancamentos.filter((l) => l.tipo === 'despesa');
    const porDia: Record<number, number> = {};
    despesas.forEach((l) => {
      const data = l.data instanceof Date ? l.data : new Date(l.data);
      const dia = data.getDate();
      porDia[dia] = (porDia[dia] ?? 0) + l.valor;
    });

    const faturasMes = faturas.filter((f) => f.mesReferencia === selectedMonth);
    const faturasDoMes: FaturaPrevisao[] = faturasMes.map((f) => {
      const venc = f.dataVencimento instanceof Date ? f.dataVencimento : new Date(f.dataVencimento);
      const cartao = getCartaoById(f.cartaoId);
      return {
        dia: venc.getDate(),
        valor: f.valorTotal,
        nomeCartao: cartao?.nome ?? 'Cartão',
      };
    });

    const acumuladoAteDia: number[] = [0];
    for (let d = 1; d <= ultimoDiaDoMes; d++) {
      acumuladoAteDia[d] = (acumuladoAteDia[d - 1] ?? 0) + (porDia[d] ?? 0);
    }

    const hasData =
      Object.keys(porDia).length > 0 || faturasDoMes.length > 0;

    return {
      despesasPorDia: porDia,
      faturasDoMes,
      ultimoDiaDoMes,
      acumuladoAteDia,
      hasData,
    };
  }, [selectedMonth, getLancamentosPorMes, faturas, getCartaoById]);
}
