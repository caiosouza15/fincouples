import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';

interface MetricasPessoa {
  nome: string;
  totalGastos: number;
  totalReceitas: number;
  saldo: number;
}

interface ChartPorPessoaProps {
  metricas: [MetricasPessoa, MetricasPessoa];
}

const COR_USUARIO1 = '#3b82f6';
const COR_USUARIO2 = '#8b5cf6';

export function ChartPorPessoa({ metricas }: ChartPorPessoaProps) {
  const [m1, m2] = metricas;

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, stacked: false },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    colors: [COR_USUARIO1, COR_USUARIO2],
    xaxis: { categories: ['Gastos', 'Receitas', 'Saldo'] },
    yaxis: {
      labels: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
    legend: { position: 'top', horizontalAlign: 'right' },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb' },
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
