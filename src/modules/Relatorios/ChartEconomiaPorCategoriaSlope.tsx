import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { getMesAnterior } from '@/utils/relatoriosUtils';
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
  '#ef4444',
  '#a855f7',
  '#64748b',
  '#eab308',
  '#0ea5e9',
];

type ItemGasto = { categoriaId: string; categoria: Categoria; valor: number };

interface ChartEconomiaPorCategoriaSlopeProps {
  selectedMonth: string;
  categorias: Categoria[];
  getMaioresGastos: (categorias: Categoria[], limit?: number, mes?: string) => ItemGasto[];
}

export function ChartEconomiaPorCategoriaSlope({
  selectedMonth,
  categorias,
  getMaioresGastos,
}: ChartEconomiaPorCategoriaSlopeProps) {
  const { resolvedTheme } = useTheme();
  const { series, hasData } = useMemo(() => {
    const mesAnterior = getMesAnterior(selectedMonth);
    const gastosAnterior = getMaioresGastos(categorias, 30, mesAnterior);
    const gastosAtual = getMaioresGastos(categorias, 30, selectedMonth);

    const byIdAnterior = new Map(gastosAnterior.map((g) => [g.categoriaId, g.valor]));
    const byIdAtual = new Map(gastosAtual.map((g) => [g.categoriaId, g.valor]));
    const allIds = new Set([...byIdAnterior.keys(), ...byIdAtual.keys()]);

    const LABEL_ANTERIOR = 'Mês passado';
    const LABEL_ATUAL = 'Este mês';

    const items: { nome: string; data: { x: string; y: number }[] }[] = [];
    allIds.forEach((categoriaId) => {
      const valorAnterior = byIdAnterior.get(categoriaId) ?? 0;
      const valorAtual = byIdAtual.get(categoriaId) ?? 0;
      if (valorAnterior === 0 && valorAtual === 0) return;
      const cat = categorias.find((c) => c.id === categoriaId) ?? { id: categoriaId, nome: 'Desconhecida', tipo: 'despesa' as const };
      items.push({
        nome: cat.nome,
        data: [
          { x: LABEL_ANTERIOR, y: valorAnterior },
          { x: LABEL_ATUAL, y: valorAtual },
        ],
      });
    });

    items.sort((a, b) => {
      const sumA = a.data[0].y + a.data[1].y;
      const sumB = b.data[0].y + b.data[1].y;
      return sumB - sumA;
    });
    const top = items.slice(0, 15);

    return {
      series: top.map((i) => ({ name: i.nome, data: i.data })),
      hasData: top.length > 0,
    };
  }, [selectedMonth, categorias, getMaioresGastos]);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum gasto por categoria nos dois meses para comparar.
      </div>
    );
  }

  const options: ApexOptions = {
    theme: { mode: resolvedTheme === 'dark' ? 'dark' : 'light' },
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false }, foreColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b' },
    plotOptions: {
      line: {
        isSlopeChart: true,
      },
    },
    stroke: { curve: 'straight', width: 2 },
    colors: PALETA,
    xaxis: { position: 'bottom' as const },
    yaxis: {
      show: true,
      labels: {
        show: true,
        formatter: (val: number) => formatCurrency(val),
      },
    },
    tooltip: {
      followCursor: true,
      intersect: false,
      shared: true,
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_val: number, opts) => {
        const seriesName = opts?.w?.config?.series?.[opts.seriesIndex]?.name ?? '';
        return seriesName;
      },
      style: { fontSize: '12px' },
    },
    legend: { show: true, position: 'top', horizontalAlign: 'left' },
    grid: { borderColor: resolvedTheme === 'dark' ? '#334155' : '#e5e7eb' },
  };

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="line" height={280} />
    </div>
  );
}
