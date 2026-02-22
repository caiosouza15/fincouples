import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useEconomiaPorCategoria } from './useEconomiaPorCategoria';
import type { Categoria } from '@/types';

const COR_MES_ANTERIOR = '#3b82f6';
const COR_ESTE_MES = '#10b981';

type ItemGasto = { categoriaId: string; categoria: Categoria; valor: number };

interface ChartEconomiaGroupedBarProps {
  selectedMonth: string;
  categorias: Categoria[];
  getMaioresGastos: (categorias: Categoria[], limit?: number, mes?: string) => ItemGasto[];
}

export function ChartEconomiaGroupedBar({
  selectedMonth,
  categorias,
  getMaioresGastos,
}: ChartEconomiaGroupedBarProps) {
  const { items, hasData } = useEconomiaPorCategoria(selectedMonth, categorias, getMaioresGastos);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum gasto por categoria nos dois meses para comparar.
      </div>
    );
  }

  const categories = items.map((i) => i.nomeCategoria);
  const valoresAnterior = items.map((i) => i.valorAnterior);
  const valoresAtual = items.map((i) => i.valorAtual);

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    colors: [COR_MES_ANTERIOR, COR_ESTE_MES],
    xaxis: {
      categories,
      labels: { maxWidth: 100, rotate: -45, rotateAlways: false },
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
    legend: { position: 'top', horizontalAlign: 'right' },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb' },
  };

  const series = [
    { name: 'Mês passado', data: valoresAnterior },
    { name: 'Este mês', data: valoresAtual },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
