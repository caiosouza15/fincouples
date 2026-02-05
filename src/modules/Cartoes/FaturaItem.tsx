import type { FaturaCartao } from '@/types';
import { formatCurrency } from '@/utils';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface FaturaItemProps {
  fatura: FaturaCartao;
  onMarcarComoPaga: (faturaId: string, valorPago?: number) => void;
}

export function FaturaItem({ fatura, onMarcarComoPaga }: FaturaItemProps) {
  const formatMes = (mesReferencia: string) => {
    const [ano, mes] = mesReferencia.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusIcon = () => {
    switch (fatura.status) {
      case 'pago_total':
        return <CheckCircle2 size={20} className="text-positive" />;
      case 'pago_parcial':
        return <Clock size={20} className="text-warning" />;
      default:
        return <AlertCircle size={20} className="text-negative" />;
    }
  };

  const getStatusLabel = () => {
    switch (fatura.status) {
      case 'pago_total':
        return 'Pago';
      case 'pago_parcial':
        return 'Pago Parcial';
      default:
        return 'Não Pago';
    }
  };

  const getStatusColor = () => {
    switch (fatura.status) {
      case 'pago_total':
        return 'text-positive';
      case 'pago_parcial':
        return 'text-warning';
      default:
        return 'text-negative';
    }
  };

  const valorRestante = fatura.valorTotal - fatura.valorPago;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-md bg-surface border border-border rounded-md transition-all duration-200 gap-md hover:border-positive hover:shadow-sm">
      <div className="flex items-center gap-md flex-1 min-w-0">
        <div className="shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-text-primary mb-xs">
            {formatMes(fatura.mesReferencia)}
          </div>
          <div className="text-sm text-text-secondary">
            Fechamento: {formatDate(fatura.dataFechamento)} • Vencimento: {formatDate(fatura.dataVencimento)}
          </div>
          <div className="text-sm text-text-primary mt-xs">
            Total: {formatCurrency(fatura.valorTotal)} • Pago: {formatCurrency(fatura.valorPago)}
            {valorRestante > 0 && (
              <span className="text-negative ml-sm">• Restante: {formatCurrency(valorRestante)}</span>
            )}
          </div>
        </div>
        <div className={`text-sm font-semibold shrink-0 ${getStatusColor()}`}>
          {getStatusLabel()}
        </div>
      </div>
      {fatura.status !== 'pago_total' && (
        <div className="flex gap-xs shrink-0 md:justify-start justify-end md:border-0 border-t border-border md:pt-0 pt-sm">
          <button
            className="py-xs px-md rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-positive text-white hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => onMarcarComoPaga(fatura.id, fatura.valorTotal)}
          >
            Marcar como Pago
          </button>
        </div>
      )}
    </div>
  );
}
