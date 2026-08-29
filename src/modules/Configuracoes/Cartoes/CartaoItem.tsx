import type { CartaoCredito } from '@/types';
import { formatCurrencyWithPrivacy } from '@/utils';
import { usePrivacy } from '@/hooks/usePrivacy';
import { CreditCard, Power, Pencil, Trash2 } from 'lucide-react';
import styles from './CartaoItem.module.css';

interface CartaoItemProps {
  cartao: CartaoCredito;
  hideValues?: boolean;
  onEdit: (cartao: CartaoCredito) => void;
  onDelete: (id: string) => void;
  onToggleAtivo: (id: string) => void;
}

export function CartaoItem({ cartao, hideValues, onEdit, onDelete, onToggleAtivo }: CartaoItemProps) {
  const { valuesHidden } = usePrivacy();
  const aplicarBlur = hideValues !== undefined ? hideValues : valuesHidden;

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o cartão "${cartao.nome}"?`)) {
      onDelete(cartao.id);
    }
  };

  const percentualUsado = cartao.limite > 0
    ? ((cartao.limite - cartao.limiteDisponivel) / cartao.limite) * 100
    : 0;

  const progressClass =
    percentualUsado > 80 ? styles.progressHigh : percentualUsado > 50 ? styles.progressMed : styles.progressLow;

  return (
    <div className={`${styles.row} ${!cartao.ativo ? styles.rowInactive : ''}`}>
      <div className={styles.icon}><CreditCard size={18} /></div>

      <div className={styles.info}>
        <div className={styles.name}>{cartao.nome}</div>
        <div className={styles.detail}>
          Limite: {formatCurrencyWithPrivacy(cartao.limite, aplicarBlur)} • Disponível: {formatCurrencyWithPrivacy(cartao.limiteDisponivel, aplicarBlur)}
        </div>
        <div className={styles.detail}>
          Fechamento: dia {cartao.fechamento} • Vencimento: dia {cartao.vencimento}
        </div>
        {cartao.faturaAtual > 0 && (
          <div className={styles.detailNegative}>Fatura atual: {formatCurrencyWithPrivacy(cartao.faturaAtual, aplicarBlur)}</div>
        )}
      </div>

      {percentualUsado > 0 && (
        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <div className={`${styles.progressFill} ${progressClass}`} style={{ width: `${Math.min(percentualUsado, 100)}%` }} />
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${cartao.ativo ? styles.actionBtnActive : ''}`}
          onClick={() => onToggleAtivo(cartao.id)}
          aria-label={cartao.ativo ? 'Desativar cartão' : 'Ativar cartão'}
          title={cartao.ativo ? 'Desativar cartão' : 'Ativar cartão'}
        >
          <Power size={14} />
        </button>
        <button className={styles.actionBtn} onClick={() => onEdit(cartao)} aria-label="Editar cartão" title="Editar cartão">
          <Pencil size={14} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={handleDelete}
          aria-label="Excluir cartão"
          title="Excluir cartão"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
