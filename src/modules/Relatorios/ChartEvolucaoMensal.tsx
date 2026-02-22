import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { getUltimos12Meses, formatMonthLabel } from '@/utils/relatoriosUtils';

const COR_RECEITA = '#22c55e';
const COR_DESPESA = '#ef4444';

interface ChartEvolucaoMensalProps {
  selectedMonth: string;
  getReceitaMensal: (mes: string) => number;
  getDespesaMensal: (mes: string) => number;
}

export function ChartEvolucaoMensal({
  selectedMonth,
  getReceitaMensal,
  getDespesaMensal,
}: ChartEvolucaoMensalProps) {
  const { resolvedTheme } = useTheme();
  const meses = getUltimos12Meses(selectedMonth);
  const labels = meses.map(formatMonthLabel);
  const receitas = meses.map((m) => getReceitaMensal(m));
  const despesas = meses.map((m) => getDespesaMensal(m));

  const options: ApexOptions = {
    theme: { mode: resolvedTheme === 'dark' ? 'dark' : 'light' },
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, foreColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b' },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', opacity: 0.3 },
    colors: [COR_RECEITA, COR_DESPESA],
    xaxis: { categories: labels },
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
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    dataLabels: { enabled: false },
    grid: { borderColor: resolvedTheme === 'dark' ? '#334155' : '#e5e7eb' },
  };

  const series = [
    { name: 'Receitas', data: receitas },
    { name: 'Despesas', data: despesas },
  ];

  const temDados = receitas.some((r) => r > 0) || despesas.some((d) => d > 0);
  if (!temDados) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum dado nos últimos 12 meses.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="area" height={280} />
    </div>
  );
}
