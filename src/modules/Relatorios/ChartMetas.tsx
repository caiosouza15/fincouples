import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import { useMetas } from '@/hooks/useMetas';
import styles from './Relatorios.module.css';

export function ChartMetas() {
  const { metas } = useMetas();
  const { apexBase, cores } = useChartTheme();

  const metasAtivas = metas.filter((m) => !m.concluida);
  const labels = metasAtivas.map((m) => m.titulo);
  const valoresAtuais = metasAtivas.map((m) => m.valorAtual);
  const valoresObjetivo = metasAtivas.map((m) => m.valorObjetivo);

  if (metas.length === 0) {
    return <div className={styles.chartEmpty}>Nenhuma meta cadastrada. Crie metas em Metas para acompanhar seu progresso.</div>;
  }

  if (metasAtivas.length === 0) {
    return <div className={styles.chartEmpty}>Todas as metas foram concluídas! Parabéns!</div>;
  }

  const [bom, atencao, baixo] = cores.statusMeta;

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'bar' },
    plotOptions: {
      bar: { horizontal: true, barHeight: '60%', distributed: true, dataLabels: { position: 'top' } },
    },
    colors: metasAtivas.map((_, i) => {
      const pct = valoresObjetivo[i] > 0 ? (valoresAtuais[i] / valoresObjetivo[i]) * 100 : 0;
      return pct >= 100 ? bom : pct >= 50 ? atencao : baixo;
    }),
    xaxis: {
      categories: labels,
      max: Math.max(...valoresObjetivo, 1) * 1.1,
      labels: { formatter: (val: string) => formatCurrency(Number(val)) },
    },
    yaxis: {
      labels: { maxWidth: 120, style: { fontSize: '12px' } },
    },
    tooltip: {
      ...apexBase.tooltip,
      y: {
        formatter: (val: number, opts) => {
          const idx = opts?.dataPointIndex ?? 0;
          const objetivo = valoresObjetivo[idx] ?? 0;
          const pct = objetivo > 0 ? Math.round((val / objetivo) * 100) : 0;
          return `${formatCurrency(val)} / ${formatCurrency(objetivo)} (${pct}%)`;
        },
      },
    },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts) => {
        const idx = opts?.dataPointIndex ?? 0;
        const objetivo = valoresObjetivo[idx] ?? 0;
        const pct = objetivo > 0 ? Math.round((val / objetivo) * 100) : 0;
        return `${pct}%`;
      },
    },
  };

  const series = [{ name: 'Valor atual', data: valoresAtuais }];
  const height = Math.max(200, metasAtivas.length * 50);

  return (
    <div className="w-full min-w-0" style={{ height }}>
      <Chart options={options} series={series} type="bar" height={height} />
    </div>
  );
}
