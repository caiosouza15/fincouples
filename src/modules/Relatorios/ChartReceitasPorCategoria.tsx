import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import type { Categoria } from '@/types';

const PALETA = [
  '#3b82f6', // azul
  '#8b5cf6', // violeta
  '#ec4899', // rosa
  '#f59e0b', // âmbar
  '#10b981', // esmeralda
  '#06b6d4', // ciano
  '#6366f1', // índigo
  '#84cc16', // lima
  '#f97316', // laranja
  '#14b8a6', // teal
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
  if (itens.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhuma receita no mês selecionado.
      </div>
    );
  }

  const options: ApexOptions = {
    chart: { type: 'donut', toolbar: { show: false }, width: '100%' },
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
