import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/contexts/ThemeContext';
import type { Categoria } from '@/types';

// Cores de marca (tokens): teal #0FB9B1, pink #F78FB3
const PALETA = [
  '#0FB9B1',
  '#F78FB3',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#84cc16',
  '#f97316',
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
  const { resolvedTheme } = useTheme();

  if (itens.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum gasto no mês selecionado.
      </div>
    );
  }

  const options: ApexOptions = {
    theme: { mode: resolvedTheme === 'dark' ? 'dark' : 'light' },
    chart: { type: 'bar', toolbar: { show: false }, foreColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b' },
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
    grid: { borderColor: resolvedTheme === 'dark' ? '#334155' : '#e5e7eb' },
  };

  const series = [{ name: 'Gastos', data: itens.map((i) => i.valor) }];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
