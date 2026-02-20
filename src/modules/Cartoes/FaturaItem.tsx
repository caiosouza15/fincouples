import { useState } from 'react';
import type { FaturaCartao, Lancamento, CartaoCredito } from '@/types';
import { formatCurrency } from '@/utils';
import { parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FaturaDetalhes } from './FaturaDetalhes';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface FaturaItemProps {
  fatura: FaturaCartao;
  cartao: CartaoCredito;
  lancamentos: Lancamento[];
  categorias: Array<{ id: string; nome: string; icone?: string }>;
  onMarcarComoPaga: (faturaId: string, valorPago?: number) => void;
}

export function FaturaItem({ fatura, cartao, lancamentos, categorias, onMarcarComoPaga }: FaturaItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPagamentoParcial, setShowPagamentoParcial] = useState(false);
  const [valorParcial, setValorParcial] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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

  const handlePagarParcial = () => {
    const valor = parseNumberInput(valorParcial);
    if (isNaN(valor) || valor <= 0) {
      setErrorMessage('Valor inválido. Por favor, insira um valor maior que zero.');
      setShowErrorDialog(true);
      return;
    }
    if (valor > valorRestante) {
      setErrorMessage(`Valor não pode ser maior que o valor restante (${formatCurrency(valorRestante)}).`);
      setShowErrorDialog(true);
      return;
    }
    onMarcarComoPaga(fatura.id, valor);
    setShowPagamentoParcial(false);
    setValorParcial('');
  };

  return (
    <div className="bg-surface border border-border rounded-md transition-all duration-200 hover:border-positive hover:shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-md gap-md">
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
              Pagar Total
            </button>
            {valorRestante > 0 && (
              <button
                className="py-xs px-md rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border border-border bg-surface text-text-primary hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setShowPagamentoParcial(!showPagamentoParcial)}
              >
                Pagar Parcial
              </button>
            )}
          </div>
        )}
      </div>

      {showPagamentoParcial && fatura.status !== 'pago_total' && (
        <div className="px-md pb-md border-t border-border pt-md">
          <div className="flex flex-col gap-sm">
            <label className="text-sm font-medium text-text-primary">
              Valor a pagar (máximo: {formatCurrency(valorRestante)})
            </label>
            <div className="flex gap-xs">
              <input
                type="text"
                inputMode="decimal"
                className="flex-1 p-sm border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive"
                value={valorParcial}
                onChange={(e) => setValorParcial(handleNumberInputChange(e, true))}
                placeholder="0,00"
              />
              <button
                className="py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-positive text-white hover:bg-[#16a34a]"
                onClick={handlePagarParcial}
              >
                Confirmar
              </button>
              <button
                className="py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border border-border bg-surface text-text-primary hover:bg-background"
                onClick={() => {
                  setShowPagamentoParcial(false);
                  setValorParcial('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-md pb-md border-t border-border">
        <button
          className="flex items-center justify-between w-full py-sm text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
          onClick={() => setExpanded(!expanded)}
        >
          <span>{expanded ? 'Ocultar' : 'Ver'} detalhes da fatura</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded && (
          <FaturaDetalhes
            fatura={fatura}
            cartao={cartao}
            lancamentos={lancamentos}
            categorias={categorias}
          />
        )}
      </div>
      <ConfirmDialog
        isOpen={showErrorDialog}
        title="Erro no pagamento"
        message={errorMessage}
        confirmText="Entendi"
        variant="warning"
        onConfirm={() => setShowErrorDialog(false)}
        onCancel={() => setShowErrorDialog(false)}
      />
    </div>
  );
}
