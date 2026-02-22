import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/contexts/ThemeContext';
import type { Categoria } from '@/types';

// Cores de marca (tokens): teal #0FB9B1, pink #F78FB3
const PALETA = [
  '#0FB9B1', // teal
  '#F78FB3', // pink
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#84cc16',
  '#f97316',
];

interface ItemReceita {
  categoriaId: string;
  categoria: Categoria;
  valor: number;
}

interface ChartReceitasPorCategoriaProps {
  itens: ItemReceita[];
}

export function ChartReceitasPorCategoria({ itens }: ChartReceitasPorCategoriaProps) {
  const { resolvedTheme } = useTheme();

  if (itens.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhuma receita no mês selecionado.
      </div>
    );
  }

  const options: ApexOptions = {
    theme: { mode: resolvedTheme === 'dark' ? 'dark' : 'light' },
    chart: { type: 'donut', toolbar: { show: false }, width: '100%', foreColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b' },
    colors: PALETA,
    labels: itens.map((i) => i.categoria.nome),
    legend: { position: 'right', fontSize: '14px' },
    dataLabels: { formatter: (val: number) => `${val.toFixed(1)}%`, fontSize: '14px' },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            name: { fontSize: '16px' },
            value: { fontSize: '20px' },
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
              formatter: () => formatCurrency(itens.reduce((s, i) => s + i.valor, 0)),
            },
          },
        },
      },
    },
  };

  const series = itens.map((i) => i.valor);

  return (
    <div className="w-full min-w-0" style={{ height: 380 }}>
      <Chart options={options} series={series} type="donut" height={380} />
    </div>
  );
}
