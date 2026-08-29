import { useLancamentos } from '@/hooks/useLancamentos';
import { formatCurrency } from '@/utils';
import { getMesAnterior } from '@/utils/relatoriosUtils';
import styles from './Relatorios.module.css';

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
    <div className={styles.statGrid}>
      <div className={`${styles.stat} ${styles.statFull}`}>
        <span className={styles.statLabel}>Comparativo mês anterior</span>
        <span className={styles.statComparativo}>{comparativoTexto}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Receitas totais</span>
        <span className={`${styles.statValue} ${styles.statValuePositive}`}>{formatCurrency(receita)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Despesas totais</span>
        <span className={`${styles.statValue} ${styles.statValueNegative}`}>{formatCurrency(despesa)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Saldo do mês</span>
        <span className={`${styles.statValue} ${saldo >= 0 ? styles.statValuePositive : styles.statValueNegative}`}>
          {formatCurrency(saldo)}
        </span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Taxa de economia</span>
        <span className={`${styles.statValue} ${taxaEconomia >= 0 ? styles.statValuePositive : styles.statValueNegative}`}>
          {receita > 0 ? `${taxaEconomia.toFixed(1)}%` : '—'}
        </span>
      </div>
    </div>
  );
}
