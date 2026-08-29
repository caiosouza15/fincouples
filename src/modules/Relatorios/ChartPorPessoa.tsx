import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';

interface MetricasPessoa {
  nome: string;
  totalGastos: number;
  totalReceitas: number;
  saldo: number;
}

interface ChartPorPessoaProps {
  metricas: readonly [MetricasPessoa, MetricasPessoa];
}

export function ChartPorPessoa({ metricas }: ChartPorPessoaProps) {
  const { apexBase, cores } = useChartTheme();
  const [m1, m2] = metricas;

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'bar', stacked: false },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 },
    },
    colors: cores.pessoa,
    xaxis: { categories: ['Gastos', 'Receitas', 'Saldo'] },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const series = [
    { name: m1.nome, data: [m1.totalGastos, m1.totalReceitas, m1.saldo] },
    { name: m2.nome, data: [m2.totalGastos, m2.totalReceitas, m2.saldo] },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
