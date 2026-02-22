import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import type { Categoria } from '@/types';

const PALETA = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#84cc16',
  '#f97316',
  '#14b8a6',
];

interface ItemGasto {
  categoriaId: string;
  categoria: Categoria;
  valor: number;
}

interface ChartGastosPorCategoriaProps {
  itens: ItemGasto[];
  selectedMonth?: string;
}

export function ChartGastosPorCategoria({ itens }: ChartGastosPorCategoriaProps) {
  if (itens.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum gasto no mês selecionado.
      </div>
    );
  }

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
        distributed: true,
      },
    },
    colors: PALETA,
    xaxis: {
      categories: itens.map((i) => i.categoria.nome),
      labels: {
        maxWidth: 120,
        rotate: -45,
        rotateAlways: false,
      },
    },
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

  const series = [{ name: 'Gastos', data: itens.map((i) => i.valor) }];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
