import { useMemo } from 'react';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useFaturas } from '@/hooks/useFaturas';
import { useCartoes } from '@/hooks/useCartoes';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { formatCurrency } from '@/utils';

export function CalendarioVencimentos() {
  const { getLancamentosPorMes } = useLancamentos();
  const { faturas } = useFaturas();
  const { getCartaoById } = useCartoes();
  const { selectedMonth } = useSelectedMonth();

  const [despesasPorDia, faturasDoMes] = useMemo(() => {
    const lancamentos = getLancamentosPorMes(selectedMonth);
    const despesas = lancamentos.filter((l) => l.tipo === 'despesa');
    const porDia: Record<number, number> = {};
    despesas.forEach((l) => {
      const data = l.data instanceof Date ? l.data : new Date(l.data);
      const dia = data.getDate();
      porDia[dia] = (porDia[dia] ?? 0) + l.valor;
    });

    const faturasMes = faturas.filter((f) => f.mesReferencia === selectedMonth);

    return [porDia, faturasMes] as const;
  }, [selectedMonth, getLancamentosPorMes, faturas]);

  const diasComDespesas = Object.keys(despesasPorDia)
    .map(Number)
    .sort((a, b) => a - b);
  const temDespesas = diasComDespesas.length > 0;
  const temFaturas = faturasDoMes.length > 0;

  if (!temDespesas && !temFaturas) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum vencimento no mês selecionado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-lg min-w-0">
      {temDespesas && (
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-text-primary mb-2 sm:mb-md">Despesas por dia</h4>
          <ul className="space-y-1">
            {diasComDespesas.map((dia) => (
              <li key={dia} className="flex justify-between gap-2 text-xs sm:text-sm min-w-0">
                <span className="text-text-secondary shrink-0">Dia {dia}</span>
                <span className="font-medium text-negative truncate">{formatCurrency(despesasPorDia[dia] ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {temFaturas && (
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-text-primary mb-2 sm:mb-md">Faturas de cartão</h4>
          <ul className="space-y-1">
            {faturasDoMes.map((f) => {
              const cartao = getCartaoById(f.cartaoId);
              const venc = f.dataVencimento instanceof Date ? f.dataVencimento : new Date(f.dataVencimento);
              return (
                <li key={f.id} className="flex justify-between gap-2 text-xs sm:text-sm items-center min-w-0">
                  <span className="text-text-primary truncate flex-1 min-w-0">{cartao?.nome ?? 'Cartão'}</span>
                  <span className="text-text-secondary shrink-0 text-right">
                    Venc. dia {venc.getDate()} • {formatCurrency(f.valorTotal)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
