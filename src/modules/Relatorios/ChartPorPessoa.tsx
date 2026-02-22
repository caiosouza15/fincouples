import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { resolvedTheme } = useTheme();
  const [m1, m2] = metricas;

  const options: ApexOptions = {
    theme: { mode: resolvedTheme === 'dark' ? 'dark' : 'light' },
    chart: { type: 'bar', toolbar: { show: false }, stacked: false, foreColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b' },
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
    grid: { borderColor: resolvedTheme === 'dark' ? '#334155' : '#e5e7eb' },
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
