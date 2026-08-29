import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import type { CartaoCredito } from '@/types';
import styles from './Relatorios.module.css';

interface ChartUsoCartoesProps {
  cartoes: CartaoCredito[];
}

export function ChartUsoCartoes({ cartoes }: ChartUsoCartoesProps) {
  const { apexBase, cores } = useChartTheme();
  const ativos = cartoes.filter((c) => c.ativo);
  if (ativos.length === 0) {
    return <div className={styles.chartEmpty}>Nenhum cartão ativo.</div>;
  }

  const categories = ativos.map((c) => c.nome);
  const usado = ativos.map((c) => c.limite - c.limiteDisponivel);
  const disponivel = ativos.map((c) => c.limiteDisponivel);

  const [positivo, negativo] = cores.polaridade;

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'bar', stacked: true },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 },
    },
    colors: [negativo, positivo],
    xaxis: { categories },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const series = [
    { name: 'Usado', data: usado },
    { name: 'Disponível', data: disponivel },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
