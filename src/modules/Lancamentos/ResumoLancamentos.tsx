import { useMemo } from 'react';
import type { Lancamento } from '@/types';
import { formatCurrency } from '@/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './Lancamentos.module.css';

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
    return { totalReceitas: receitas, totalDespesas: despesas, saldo: receitas - despesas };
  }, [lancamentos, mesRef]);

  return (
    <div className={styles.statGrid}>
      <div className={styles.stat}>
        <span className={styles.statLabel}><TrendingUp size={14} /> Receitas</span>
        <span className={`${styles.statValue} ${styles.statValuePositive}`}>{formatCurrency(totalReceitas)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}><TrendingDown size={14} /> Despesas</span>
        <span className={`${styles.statValue} ${styles.statValueNegative}`}>{formatCurrency(totalDespesas)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}><Minus size={14} /> Saldo do período</span>
        <span className={`${styles.statValue} ${saldo >= 0 ? styles.statValuePositive : styles.statValueNegative}`}>
          {formatCurrency(saldo)}
        </span>
      </div>
    </div>
  );
}
