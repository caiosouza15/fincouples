import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import { useVencimentosPrevisoes } from './useVencimentosPrevisoes';
import styles from './Relatorios.module.css';

export function ChartPrevisoesBarras() {
  const { apexBase, cores } = useChartTheme();
  const { despesasPorDia, faturasDoMes, ultimoDiaDoMes, hasData } = useVencimentosPrevisoes();

  if (!hasData) {
    return <div className={styles.chartEmpty}>Nenhuma despesa ou fatura no mês selecionado.</div>;
  }

  const dias = Array.from({ length: ultimoDiaDoMes }, (_, i) => i + 1);
  const despesasData = dias.map((d) => despesasPorDia[d] ?? 0);

  const faturasPorDia: Record<number, number> = {};
  faturasDoMes.forEach((f) => {
    faturasPorDia[f.dia] = (faturasPorDia[f.dia] ?? 0) + f.valor;
  });
  const faturasData = dias.map((d) => faturasPorDia[d] ?? 0);

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'bar', stacked: true },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '80%', borderRadius: 2 },
    },
    colors: [cores.categorica[7], cores.categorica[6]],
    xaxis: { categories: dias.map(String), title: { text: 'Dia do mês' } },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const series = [
    { name: 'Despesas', data: despesasData },
    { name: 'Faturas', data: faturasData },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 320 }}>
      <Chart options={options} series={series} type="bar" height={320} />
    </div>
  );
}
