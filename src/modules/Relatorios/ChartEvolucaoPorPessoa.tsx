import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import { getUltimos12Meses, formatMonthLabel } from '@/utils/relatoriosUtils';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCasal } from '@/hooks/useCasal';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import styles from './Relatorios.module.css';

export function ChartEvolucaoPorPessoa() {
  const { apexBase, cores } = useChartTheme();
  const { getLancamentosPorMes } = useLancamentos();
  const { usuario1Nome, usuario2Nome } = useCasal();
  const { selectedMonth } = useSelectedMonth();
  const meses = getUltimos12Meses(selectedMonth);
  const labels = meses.map(formatMonthLabel);

  const gastos1 = meses.map((m) => {
    const lancamentos = getLancamentosPorMes(m);
    return lancamentos
      .filter((l) => l.tipo === 'despesa' && l.pessoaId === 'usuario1')
      .reduce((s, l) => s + l.valor, 0);
  });
  const gastos2 = meses.map((m) => {
    const lancamentos = getLancamentosPorMes(m);
    return lancamentos
      .filter((l) => l.tipo === 'despesa' && l.pessoaId === 'usuario2')
      .reduce((s, l) => s + l.valor, 0);
  });

  const temDados = gastos1.some((v) => v > 0) || gastos2.some((v) => v > 0);
  if (!temDados) {
    return <div className={styles.chartEmpty}>Nenhum gasto por pessoa nos últimos 12 meses.</div>;
  }

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'line', zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors: cores.pessoa,
    xaxis: { categories: labels },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const series = [
    { name: usuario1Nome, data: gastos1 },
    { name: usuario2Nome, data: gastos2 },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 300 }}>
      <Chart options={options} series={series} type="line" height={300} />
    </div>
  );
}
