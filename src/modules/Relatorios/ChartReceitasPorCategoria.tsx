import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import styles from './Relatorios.module.css';

interface ItemReceita {
  categoriaId: string;
  categoria: { id: string; nome: string; tipo: string };
  valor: number;
}

interface ChartReceitasPorCategoriaProps {
  itens: ItemReceita[];
}

export function ChartReceitasPorCategoria({ itens }: ChartReceitasPorCategoriaProps) {
  const { apexBase, categoriaCor } = useChartTheme();

  if (itens.length === 0) {
    return <div className={styles.chartEmpty}>Nenhuma receita no mês selecionado.</div>;
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

  const series = [{ name: 'Receita', data: values }];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
