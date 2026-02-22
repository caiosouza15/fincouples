import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { getUltimos12Meses, formatMonthLabel } from '@/utils/relatoriosUtils';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCasal } from '@/hooks/useCasal';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';

const COR_USUARIO1 = '#3b82f6';
const COR_USUARIO2 = '#8b5cf6';

export function ChartEvolucaoPorPessoa() {
  const { resolvedTheme } = useTheme();
  const { getLancamentosPorMes } = useLancamentos();
  const { usuario1Nome, usuario2Nome } = useCasal();
  const { selectedMonth } = useSelectedMonth();
  const meses = getUltimos12Meses(selectedMonth);
  const labels = meses.map(formatMonthLabel);

  const gastos1 = meses.map((m) => {
    const lancamentos = getLancamentosPorMes(m);
    return lancamentos
      .filter((l) => l.tipo === 'despesa' && l.pessoaId === 'usuario1')
      .reduce((s, l) => s + l.valor, 0);
  });
  const gastos2 = meses.map((m) => {
    const lancamentos = getLancamentosPorMes(m);
    return lancamentos
      .filter((l) => l.tipo === 'despesa' && l.pessoaId === 'usuario2')
      .reduce((s, l) => s + l.valor, 0);
  });

  const options: ApexOptions = {
    theme: { mode: resolvedTheme === 'dark' ? 'dark' : 'light' },
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false }, foreColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b' },
    stroke: { curve: 'smooth', width: 2 },
    colors: [COR_USUARIO1, COR_USUARIO2],
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
    legend: { position: 'top', horizontalAlign: 'right' },
    dataLabels: { enabled: false },
    grid: { borderColor: resolvedTheme === 'dark' ? '#334155' : '#e5e7eb' },
  };

  const series = [
    { name: usuario1Nome, data: gastos1 },
    { name: usuario2Nome, data: gastos2 },
  ];

  const temDados = gastos1.some((v) => v > 0) || gastos2.some((v) => v > 0);
  if (!temDados) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum gasto por pessoa nos últimos 12 meses.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="line" height={280} />
    </div>
  );
}
