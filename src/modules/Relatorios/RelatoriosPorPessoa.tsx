import { useMemo } from 'react';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCasal } from '@/hooks/useCasal';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { formatCurrency } from '@/utils';
import { ChartPorPessoa } from './ChartPorPessoa';
import styles from './Relatorios.module.css';

export function RelatoriosPorPessoa() {
  const { getLancamentosPorMes } = useLancamentos();
  const { usuario1Nome, usuario2Nome } = useCasal();
  const { selectedMonth } = useSelectedMonth();

  const metricas = useMemo(() => {
    const lancamentos = getLancamentosPorMes(selectedMonth);

    const gastos1 = lancamentos
      .filter((l) => l.tipo === 'despesa' && l.pessoaId === 'usuario1')
      .reduce((s, l) => s + l.valor, 0);
    const gastos2 = lancamentos
      .filter((l) => l.tipo === 'despesa' && l.pessoaId === 'usuario2')
      .reduce((s, l) => s + l.valor, 0);

    const receitas1 = lancamentos
      .filter((l) => l.tipo === 'receita' && l.pessoaId === 'usuario1')
      .reduce((s, l) => s + l.valor, 0);
    const receitas2 = lancamentos
      .filter((l) => l.tipo === 'receita' && l.pessoaId === 'usuario2')
      .reduce((s, l) => s + l.valor, 0);

    const m1 = { nome: usuario1Nome, totalGastos: gastos1, totalReceitas: receitas1, saldo: receitas1 - gastos1 };
    const m2 = { nome: usuario2Nome, totalGastos: gastos2, totalReceitas: receitas2, saldo: receitas2 - gastos2 };

    return [m1, m2] as const;
  }, [selectedMonth, getLancamentosPorMes, usuario1Nome, usuario2Nome]);

  const [m1, m2] = metricas;
  const temDados = m1.totalGastos + m1.totalReceitas + m2.totalGastos + m2.totalReceitas > 0;

  if (!temDados) {
    return <div className={styles.chartEmpty}>Nenhum lançamento no mês selecionado.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className={styles.pessoaGrid}>
        {[m1, m2].map((m) => (
          <div key={m.nome} className={styles.pessoaCard}>
            <span className={styles.pessoaName}>{m.nome}</span>
            <div className={styles.pessoaRow}>
              <span className={styles.pessoaLabel}>Gastos</span>
              <span className={styles.pessoaValue}>{formatCurrency(m.totalGastos)}</span>
            </div>
            <div className={styles.pessoaRow}>
              <span className={styles.pessoaLabel}>Receitas</span>
              <span className={styles.pessoaValue}>{formatCurrency(m.totalReceitas)}</span>
            </div>
            <div className={styles.pessoaRow} style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <span className={styles.pessoaLabel}>Saldo</span>
              <span className={styles.pessoaValue}>{formatCurrency(m.saldo)}</span>
            </div>
          </div>
        ))}
      </div>
      <ChartPorPessoa metricas={metricas} />
    </div>
  );
}
