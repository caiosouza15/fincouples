import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';

const COR_RECEITA = '#22c55e';
const COR_DESPESA = '#ef4444';

interface ChartReceitasDespesasProps {
  receita: number;
  despesa: number;
  selectedMonth?: string;
}

export function ChartReceitasDespesas({ receita, despesa }: ChartReceitasDespesasProps) {
  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        distributed: true,
      },
    },
    colors: [COR_RECEITA, COR_DESPESA],
    xaxis: { categories: ['Receitas', 'Despesas'] },
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
    legend: { show: false },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb' },
  };

  const series = [{ name: 'Valor', data: [receita, despesa] }];

  if (receita === 0 && despesa === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum dado no mês selecionado.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
