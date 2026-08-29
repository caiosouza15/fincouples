import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import styles from './Relatorios.module.css';

interface ChartReceitasDespesasProps {
  receita: number;
  despesa: number;
  selectedMonth?: string;
}

export function ChartReceitasDespesas({ receita, despesa }: ChartReceitasDespesasProps) {
  const { apexBase, cores } = useChartTheme();

  if (receita === 0 && despesa === 0) {
    return <div className={styles.chartEmpty}>Nenhum dado no mês selecionado.</div>;
  }

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'bar' },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '50%', distributed: true },
    },
    colors: cores.polaridade,
    xaxis: { categories: ['Receitas', 'Despesas'] },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { show: false },
  };

  const series = [{ name: 'Valor', data: [receita, despesa] }];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
