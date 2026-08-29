import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import type { MaiorGasto } from '@/types';
import styles from './Relatorios.module.css';

interface ChartGastosPorCategoriaProps {
  itens: MaiorGasto[];
  selectedMonth?: string;
}

export function ChartGastosPorCategoria({ itens }: ChartGastosPorCategoriaProps) {
  const { apexBase, categoriaCor } = useChartTheme();

  if (itens.length === 0) {
    return <div className={styles.chartEmpty}>Nenhum gasto no mês selecionado.</div>;
  }

  const categories = itens.map((i) => i.categoria.nome);
  const values = itens.map((i) => i.valor);
  const colors = itens.map((_, idx) => categoriaCor(idx));

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'bar' },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '60%', distributed: true, borderRadius: 4 },
    },
    colors,
    xaxis: { categories },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { show: false },
  };

  const series = [{ name: 'Despesa', data: values }];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
