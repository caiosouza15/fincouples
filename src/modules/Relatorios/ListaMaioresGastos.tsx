import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCurrency } from '@/utils';
import type { Lancamento } from '@/types';
import type { Categoria } from '@/types';

const LIMITE = 5;

function getLabel(categorias: Categoria[], l: Lancamento): string {
  const texto = (l.descricao || categorias.find((c) => c.id === l.categoriaId)?.nome) ?? 'Sem categoria';
  return texto.length > 20 ? `${texto.slice(0, 18)}…` : texto;
}

interface ListaMaioresGastosProps {
  lancamentos: Lancamento[];
  categorias: Categoria[];
}

export function ListaMaioresGastos({ lancamentos, categorias }: ListaMaioresGastosProps) {
  const lista = lancamentos.slice(0, LIMITE);

  if (lista.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhum gasto no mês selecionado.
      </div>
    );
  }

  const categories = lista.map((l) => getLabel(categorias, l));
  const values = lista.map((l) => l.valor);

  const options: ApexOptions = {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#ef4444', '#3b82f6'],
    xaxis: {
      categories,
      labels: {
        maxWidth: 100,
        rotate: -45,
        rotateAlways: false,
      },
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
    legend: { show: false },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb' },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
  };

  const series = [
    { name: 'Valor', data: values, type: 'bar' as const },
    { name: 'Valor', data: values, type: 'line' as const },
  ];

  return (
    <div className="w-full min-w-0" style={{ height: 280 }}>
      <Chart options={options} series={series} type="line" height={280} />
    </div>
  );
}
