import { useState } from 'react';
import type { FaturaCartao, Lancamento, CartaoCredito } from '@/types';
import { formatCurrency } from '@/utils';
import { parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FaturaDetalhes } from './FaturaDetalhes';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import styles from './FaturaItem.module.css';

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
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getStatusConfig = () => {
    switch (fatura.status) {
      case 'pago_total':
        return { icon: CheckCircle2, iconClass: styles.iconPago, statusClass: styles.statusPago, label: 'Pago' };
      case 'pago_parcial':
        return { icon: Clock, iconClass: styles.iconParcial, statusClass: styles.statusParcial, label: 'Pago Parcial' };
      default:
        return { icon: AlertCircle, iconClass: styles.iconNaoPago, statusClass: styles.statusNaoPago, label: 'Não Pago' };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;
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
    <div className={styles.item}>
      <div className={styles.row}>
        <div className={styles.main}>
          <div className={`${styles.statusIcon} ${config.iconClass}`}>
            <StatusIcon size={20} />
          </div>
          <div className={styles.info}>
            <div className={styles.mes}>{formatMes(fatura.mesReferencia)}</div>
            <div className={styles.dates}>
              Fechamento: {formatDate(fatura.dataFechamento)} • Vencimento: {formatDate(fatura.dataVencimento)}
            </div>
            <div className={styles.amounts}>
              Total: {formatCurrency(fatura.valorTotal)} • Pago: {formatCurrency(fatura.valorPago)}
              {valorRestante > 0 && <span className={styles.restante}>• Restante: {formatCurrency(valorRestante)}</span>}
            </div>
          </div>
          <span className={`${styles.statusLabel} ${config.statusClass}`}>{config.label}</span>
        </div>
        {fatura.status !== 'pago_total' && (
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => onMarcarComoPaga(fatura.id, fatura.valorTotal)}>
              Pagar Total
            </button>
            {valorRestante > 0 && (
              <button className={styles.btnGhost} onClick={() => setShowPagamentoParcial(!showPagamentoParcial)}>
                Pagar Parcial
              </button>
            )}
          </div>
        )}
      </div>

      {showPagamentoParcial && fatura.status !== 'pago_total' && (
        <div className={styles.partialWrap}>
          <label className={styles.partialLabel}>Valor a pagar (máximo: {formatCurrency(valorRestante)})</label>
          <div className={styles.partialRow}>
            <input
              type="text"
              inputMode="decimal"
              className={styles.partialInput}
              value={valorParcial}
              onChange={(e) => setValorParcial(handleNumberInputChange(e, true))}
              placeholder="0,00"
            />
            <button className={styles.btnPrimary} onClick={handlePagarParcial}>Confirmar</button>
            <button className={styles.btnGhost} onClick={() => { setShowPagamentoParcial(false); setValorParcial(''); }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <button className={styles.expandBtn} onClick={() => setExpanded(!expanded)}>
        <span>{expanded ? 'Ocultar' : 'Ver'} detalhes da fatura</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded && (
        <FaturaDetalhes fatura={fatura} cartao={cartao} lancamentos={lancamentos} categorias={categorias} />
      )}

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
