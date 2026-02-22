import { useMemo } from 'react';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { formatCurrency } from '@/utils';

export function ResumoParceladas() {
  const { getLancamentosPorMes } = useLancamentos();
  const { selectedMonth } = useSelectedMonth();

  const { total, quantidade, itens } = useMemo(() => {
    const lancamentos = getLancamentosPorMes(selectedMonth);
    const parceladas = lancamentos.filter((l) => l.tipo === 'despesa' && l.parcelado === true);
    const total = parceladas.reduce((s, l) => s + l.valor, 0);
    return {
      total,
      quantidade: parceladas.length,
      itens: parceladas.slice(0, 10),
    };
  }, [selectedMonth, getLancamentosPorMes]);

  if (quantidade === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhuma despesa parcelada no mês.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-md min-w-0">
      <div className="flex justify-between items-center gap-2 p-3 sm:p-md bg-surface rounded-lg border border-border min-w-0">
        <span className="text-xs sm:text-sm font-medium text-text-secondary shrink-0">Total em parcelas</span>
        <span className="text-base sm:text-lg font-semibold text-negative truncate">{formatCurrency(total)}</span>
      </div>
      <p className="text-xs sm:text-sm text-text-secondary">{quantidade} lançamento(s) parcelado(s)</p>
      {itens.length > 0 && (
        <ul className="space-y-1 min-w-0">
          {itens.map((l) => (
            <li key={l.id} className="flex justify-between gap-2 text-xs sm:text-sm min-w-0">
              <span className="text-text-primary truncate flex-1 min-w-0">{l.descricao || 'Despesa parcelada'}</span>
              <span className="text-negative shrink-0">{formatCurrency(l.valor)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
