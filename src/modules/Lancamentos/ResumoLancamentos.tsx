import { useMemo } from 'react';
import { Card } from '@/components/Card';
import type { Lancamento } from '@/types';
import { formatCurrency } from '@/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ResumoLancamentosProps {
  lancamentos: Lancamento[];
  /** Se informado, considera apenas lançamentos deste mês (YYYY-MM) */
  mesRef?: string;
}

export function ResumoLancamentos({ lancamentos, mesRef }: ResumoLancamentosProps) {
  const { totalReceitas, totalDespesas, saldo } = useMemo(() => {
    const list = mesRef
      ? lancamentos.filter((l) => {
          const d = new Date(l.data);
          const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return mes === mesRef;
        })
      : lancamentos;

    const receitas = list.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
    const despesas = list.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
    return {
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldo: receitas - despesas,
    };
  }, [lancamentos, mesRef]);

  return (
    <Card title="Resumo">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="p-md bg-background rounded-md border border-border">
          <div className="text-sm text-text-secondary uppercase mb-xs flex items-center gap-xs">
            <TrendingUp size={16} />
            Receitas
          </div>
          <div className="text-2xl font-bold text-positive">{formatCurrency(totalReceitas)}</div>
        </div>
        <div className="p-md bg-background rounded-md border border-border">
          <div className="text-sm text-text-secondary uppercase mb-xs flex items-center gap-xs">
            <TrendingDown size={16} />
            Despesas
          </div>
          <div className="text-2xl font-bold text-negative">{formatCurrency(totalDespesas)}</div>
        </div>
        <div className="p-md bg-background rounded-md border border-border">
          <div className="text-sm text-text-secondary uppercase mb-xs flex items-center gap-xs">
            <Minus size={16} />
            Saldo do período
          </div>
          <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatCurrency(saldo)}
          </div>
        </div>
      </div>
    </Card>
  );
}
