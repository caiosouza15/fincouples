import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import { useChartTheme } from './chartTheme';
import styles from './Relatorios.module.css';

interface FormaPagamento {
  conta: number;
  cartao: number;
  outros: number;
}

interface ChartFormaPagamentoProps {
  dados: FormaPagamento;
}

export function ChartFormaPagamento({ dados }: ChartFormaPagamentoProps) {
  const { apexBase, cores } = useChartTheme();
  const total = dados.conta + dados.cartao + dados.outros;
  if (total === 0) {
    return <div className={styles.chartEmpty}>Nenhuma despesa no mês selecionado.</div>;
  }

  const categories = ['Débito', 'Crédito', 'Outros'];
  const values = [dados.conta, dados.cartao, dados.outros];

  const options: ApexOptions = {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'area', zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.2 } },
    colors: [cores.categorica[0]],
    xaxis: { categories },
    yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
    tooltip: { ...apexBase.tooltip, y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { show: false },
  };

  const series = [{ name: 'Valor', data: values }];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="area" height={280} />
    </div>
  );
}
