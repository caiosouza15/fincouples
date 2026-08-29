import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import { getUltimos12Meses, formatMonthLabel } from '@/utils/relatoriosUtils';
import styles from './Relatorios.module.css';

interface ChartEvolucaoMensalProps {
  selectedMonth: string;
  getReceitaMensal: (mes: string) => number;
  getDespesaMensal: (mes: string) => number;
}

export function ChartEvolucaoMensal({
  selectedMonth,
  getReceitaMensal,
  getDespesaMensal,
}: ChartEvolucaoMensalProps) {
  const { apexBase, cores } = useChartTheme();
  const meses = getUltimos12Meses(selectedMonth);
  const labels = meses.map(formatMonthLabel);
  const receitas = meses.map((m) => getReceitaMensal(m));
  const despesas = meses.map((m) => getDespesaMensal(m));

  const temDados = receitas.some((r) => r > 0) || despesas.some((d) => d > 0);
  if (!temDados) {
    return <div className={styles.chartEmpty}>Nenhum dado nos últimos 12 meses.</div>;
  }

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'area', zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', opacity: 0.3 },
    colors: cores.polaridade,
    xaxis: { categories: labels },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const series = [
    { name: 'Receitas', data: receitas },
    { name: 'Despesas', data: despesas },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 300 }}>
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
}
