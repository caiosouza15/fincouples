import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import { getMesAnterior } from '@/utils/relatoriosUtils';
import type { Categoria } from '@/types';
import styles from './Relatorios.module.css';

interface ChartEconomiaGroupedBarProps {
  selectedMonth: string;
  categorias: Categoria[];
  getMaioresGastos: (categorias: Categoria[], limit?: number, mes?: string) => Array<{ categoriaId: string; categoria: Categoria; valor: number }>;
}

export function ChartEconomiaGroupedBar({
  selectedMonth,
  categorias,
  getMaioresGastos,
}: ChartEconomiaGroupedBarProps) {
  const { apexBase, cores } = useChartTheme();
  const mesAnterior = getMesAnterior(selectedMonth);

  const gastosAnterior = getMaioresGastos(categorias, 10, mesAnterior);
  const gastosAtual = getMaioresGastos(categorias, 10, selectedMonth);

  const byIdAnterior = new Map(gastosAnterior.map((g) => [g.categoriaId, g.valor]));
  const byIdAtual = new Map(gastosAtual.map((g) => [g.categoriaId, g.valor]));
  const allIds = new Set([...byIdAnterior.keys(), ...byIdAtual.keys()]);

  const items: { nome: string; anterior: number; atual: number }[] = [];
  allIds.forEach((categoriaId) => {
    const valorAnterior = byIdAnterior.get(categoriaId) ?? 0;
    const valorAtual = byIdAtual.get(categoriaId) ?? 0;
    if (valorAnterior === 0 && valorAtual === 0) return;
    const cat = categorias.find((c) => c.id === categoriaId) ?? { id: categoriaId, nome: 'Desconhecida', tipo: 'despesa' as const };
    items.push({ nome: cat.nome, anterior: valorAnterior, atual: valorAtual });
  });

  items.sort((a, b) => Math.max(b.anterior, b.atual) - Math.max(a.anterior, a.atual));
  const top = items.slice(0, 10);

  const categories = top.map((i) => i.nome);
  const seriesAnterior = top.map((i) => i.anterior);
  const seriesAtual = top.map((i) => i.atual);

  const hasData = seriesAnterior.some((v) => v > 0) || seriesAtual.some((v) => v > 0);
  if (!hasData) {
    return <div className={styles.chartEmpty}>Nenhum dado para comparar.</div>;
  }

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'bar' },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%', dataLabels: { position: 'top' } },
    },
    colors: [cores.neutro, cores.categorica[0]],
    xaxis: { categories },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const series = [
    { name: 'Mês anterior', data: seriesAnterior },
    { name: 'Este mês', data: seriesAtual },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 320 }}>
      <Chart options={options} series={series} type="bar" height={320} />
    </div>
  );
}
