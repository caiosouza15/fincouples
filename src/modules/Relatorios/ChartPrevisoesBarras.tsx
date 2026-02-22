import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useVencimentosPrevisoes } from './useVencimentosPrevisoes';

const COR_DESPESAS = '#ef4444';
const COR_FATURAS = '#3b82f6';

export function ChartPrevisoesBarras() {
  const { resolvedTheme } = useTheme();
  const { despesasPorDia, faturasDoMes, ultimoDiaDoMes, hasData } = useVencimentosPrevisoes();

  if (!hasData) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum vencimento ou despesa no mês selecionado.
      </div>
    );
  }

  const categories = Array.from({ length: ultimoDiaDoMes }, (_, i) => String(i + 1));
  const valoresDespesas: number[] = [];
  const valoresFaturas: number[] = [];
  for (let d = 1; d <= ultimoDiaDoMes; d++) {
    valoresDespesas.push(despesasPorDia[d] ?? 0);
    const totalFaturasNoDia = faturasDoMes.filter((f) => f.dia === d).reduce((s, f) => s + f.valor, 0);
    valoresFaturas.push(totalFaturasNoDia);
  }

  const options: ApexOptions = {
    theme: { mode: resolvedTheme === 'dark' ? 'dark' : 'light' },
    chart: { type: 'bar', toolbar: { show: false }, foreColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b' },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    colors: [COR_DESPESAS, COR_FATURAS],
    xaxis: {
      categories,
      title: { text: 'Dia do mês' },
      labels: { maxWidth: 40 },
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
    grid: { borderColor: resolvedTheme === 'dark' ? '#334155' : '#e5e7eb' },
  };

  const series = [
    { name: 'Despesas', data: valoresDespesas },
    { name: 'Faturas', data: valoresFaturas },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
