import { useLancamentos } from '@/hooks/useLancamentos';
import { formatCurrency } from '@/utils';
import { getMesAnterior } from '@/utils/relatoriosUtils';
import { Card } from '@/components/Card';

interface VisaoGeralRelatoriosProps {
  selectedMonth: string;
}

export function VisaoGeralRelatorios({ selectedMonth }: VisaoGeralRelatoriosProps) {
  const { getReceitaMensal, getDespesaMensal, getResultadoMensal } = useLancamentos();

  const receita = getReceitaMensal(selectedMonth);
  const despesa = getDespesaMensal(selectedMonth);
  const saldo = getResultadoMensal(selectedMonth);

  const mesAnterior = getMesAnterior(selectedMonth);
  const receitaAnterior = getReceitaMensal(mesAnterior);
  const despesaAnterior = getDespesaMensal(mesAnterior);

  const diffReceita = receitaAnterior > 0 ? ((receita - receitaAnterior) / receitaAnterior) * 100 : 0;
  const diffDespesa = despesaAnterior > 0 ? ((despesa - despesaAnterior) / despesaAnterior) * 100 : 0;

  const comparativoTexto =
    receitaAnterior === 0 && despesaAnterior === 0
      ? 'Sem dados no mês anterior'
      : `Receita ${diffReceita >= 0 ? '+' : ''}${diffReceita.toFixed(1)}%, Despesa ${diffDespesa >= 0 ? '+' : ''}${diffDespesa.toFixed(1)}% vs mês anterior`;

  const taxaEconomia = receita > 0 ? ((receita - despesa) / receita) * 100 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
      <Card className="!p-3 sm:!p-md !mb-0 min-w-0 col-span-2 md:col-span-4">
        <p className="text-xs sm:text-sm text-text-secondary mb-1 sm:mb-xs">Comparativo mês anterior</p>
        <p className="text-xs sm:text-sm font-medium text-text-primary line-clamp-2">{comparativoTexto}</p>
      </Card>
      <Card className="!p-3 sm:!p-md !mb-0 min-w-0">
        <p className="text-xs sm:text-sm text-text-secondary mb-1 sm:mb-xs">Receitas totais</p>
        <p className="text-base sm:text-lg font-semibold text-positive truncate">{formatCurrency(receita)}</p>
      </Card>
      <Card className="!p-3 sm:!p-md !mb-0 min-w-0">
        <p className="text-xs sm:text-sm text-text-secondary mb-1 sm:mb-xs">Despesas totais</p>
        <p className="text-base sm:text-lg font-semibold text-negative truncate">{formatCurrency(despesa)}</p>
      </Card>
      <Card className="!p-3 sm:!p-md !mb-0 min-w-0">
        <p className="text-xs sm:text-sm text-text-secondary mb-1 sm:mb-xs">Saldo do mês</p>
        <p className={`text-base sm:text-lg font-semibold truncate ${saldo >= 0 ? 'text-positive' : 'text-negative'}`}>
          {formatCurrency(saldo)}
        </p>
      </Card>
      <Card className="!p-3 sm:!p-md !mb-0 min-w-0">
        <p className="text-xs sm:text-sm text-text-secondary mb-1 sm:mb-xs">Taxa de economia</p>
        <p className={`text-base sm:text-lg font-semibold ${taxaEconomia >= 0 ? 'text-positive' : 'text-negative'}`}>
          {receita > 0 ? `${taxaEconomia >= 0 ? '' : ''}${taxaEconomia.toFixed(1)}%` : '—'}
        </p>
      </Card>
    </div>
  );
}
