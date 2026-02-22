import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';

interface FormaPagamento {
  conta: number;
  cartao: number;
  outros: number;
}

interface ChartFormaPagamentoProps {
  dados: FormaPagamento;
}

const CORES = ['#3b82f6', '#8b5cf6', '#94a3b8'];

export function ChartFormaPagamento({ dados }: ChartFormaPagamentoProps) {
  const total = dados.conta + dados.cartao + dados.outros;
  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhuma despesa no mês selecionado.
      </div>
    );
  }

  const categories = ['Débito', 'Crédito', 'Outros'];
  const values = [dados.conta, dados.cartao, dados.outros];

  const options: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.2 } },
    colors: [CORES[0]],
    xaxis: { categories },
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

  const series = [{ name: 'Valor', data: values }];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="area" height={280} />
    </div>
  );
}
