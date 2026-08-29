import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import { getUltimos12Meses, formatMonthLabel } from '@/utils/relatoriosUtils';
import styles from './Relatorios.module.css';

interface ChartSaldoAcumuladoProps {
  selectedMonth: string;
  getResultadoMensal: (mes: string) => number;
}

export function ChartSaldoAcumulado({ selectedMonth, getResultadoMensal }: ChartSaldoAcumuladoProps) {
  const { apexBase, cores } = useChartTheme();
  const meses = getUltimos12Meses(selectedMonth);
  const labels = meses.map(formatMonthLabel);
  const saldos = meses.reduce<number[]>((acc, m) => {
    const anterior = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(anterior + getResultadoMensal(m));
    return acc;
  }, []);

  const temDados = saldos.some((s) => s !== 0);
  if (!temDados) {
    return <div className={styles.chartEmpty}>Nenhum dado nos últimos 12 meses.</div>;
  }

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'line', zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors: [cores.categorica[0]],
    xaxis: { categories: labels },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { show: false },
  };

  const series = [{ name: 'Saldo acumulado', data: saldos }];

  return (
    <div className="w-full min-w-0" style={{ height: 300 }}>
      <Chart options={options} series={series} type="line" height={300} />
    </div>
  );
}
