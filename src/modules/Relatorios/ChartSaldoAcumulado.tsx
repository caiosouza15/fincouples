import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { getUltimos12Meses, formatMonthLabel } from '@/utils/relatoriosUtils';

interface ChartSaldoAcumuladoProps {
  selectedMonth: string;
  getResultadoMensal: (mes: string) => number;
}

export function ChartSaldoAcumulado({ selectedMonth, getResultadoMensal }: ChartSaldoAcumuladoProps) {
  const meses = getUltimos12Meses(selectedMonth);
  const labels = meses.map(formatMonthLabel);
  let acumulado = 0;
  const saldos = meses.map((m) => {
    acumulado += getResultadoMensal(m);
    return acumulado;
  });

  const options: ApexOptions = {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#3b82f6'],
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
    legend: { show: false },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb' },
  };

  const series = [{ name: 'Saldo acumulado', data: saldos }];

  const temDados = saldos.some((s) => s !== 0);
  if (!temDados) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum dado nos últimos 12 meses.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="line" height={280} />
    </div>
  );
}
