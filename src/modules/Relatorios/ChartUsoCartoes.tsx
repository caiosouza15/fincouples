import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/contexts/ThemeContext';
import type { CartaoCredito } from '@/types';

const COR_USADO = '#ef4444';
const COR_DISPONIVEL = '#22c55e';

interface ChartUsoCartoesProps {
  cartoes: CartaoCredito[];
}

export function ChartUsoCartoes({ cartoes }: ChartUsoCartoesProps) {
  const { resolvedTheme } = useTheme();
  const ativos = cartoes.filter((c) => c.ativo);
  if (ativos.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum cartão ativo.
      </div>
    );
  }

  const categories = ativos.map((c) => c.nome);
  const usado = ativos.map((c) => c.limite - c.limiteDisponivel);
  const disponivel = ativos.map((c) => c.limiteDisponivel);

  const options: ApexOptions = {
    theme: { mode: resolvedTheme === 'dark' ? 'dark' : 'light' },
    chart: { type: 'bar', toolbar: { show: false }, stacked: true, foreColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b' },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    colors: [COR_USADO, COR_DISPONIVEL],
    xaxis: { categories },
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
    { name: 'Usado', data: usado },
    { name: 'Disponível', data: disponivel },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
