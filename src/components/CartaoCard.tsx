import { useState } from 'react';
import { CreditCard, Edit2, Trash2, Power, Copy } from 'lucide-react';
import type { CartaoCredito } from '@/types';
import { formatCurrencyWithPrivacy } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCasal } from '@/hooks/useCasal';
import styles from './CartaoCard.module.css';

interface CartaoCardProps {
  cartao: CartaoCredito;
  hideValues?: boolean;
  onEdit: (cartao: CartaoCredito) => void;
  onDelete: (id: string) => void;
  onToggleAtivo: (id: string) => void;
  onDuplicate?: (cartao: CartaoCredito) => void;
}

export function CartaoCard({
  cartao,
  hideValues = false,
  onEdit,
  onDelete,
  onToggleAtivo,
  onDuplicate,
}: CartaoCardProps) {
  const { getNomePessoa } = useCasal();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const porcentagemUso = cartao.limite > 0
    ? Math.min((cartao.faturaAtual / cartao.limite) * 100, 100)
    : 0;

  const IconComponent = cartao.icone ? iconMap[cartao.icone] : CreditCard;
  const numeroCartao = `**** **** **** ${cartao.id.slice(-4).padStart(4, '0')}`;

  const nomeProprietario = cartao.proprietarioId
    ? (cartao.nomeProprietario || getNomePessoa(cartao.proprietarioId))
    : null;

  const progressClass =
    porcentagemUso >= 90 ? styles.progressHigh : porcentagemUso >= 70 ? styles.progressMed : styles.progressLow;

  const handleDelete = () => {
    onDelete(cartao.id);
    setShowConfirmDelete(false);
  };

  return (
    <>
      <div className={`${styles.card} ${!cartao.ativo ? styles.cardInactive : ''}`}>
        <div className={styles.actions}>
          {onDuplicate && (
            <button className={styles.actionBtn} onClick={() => onDuplicate(cartao)} aria-label="Duplicar cartão" title="Duplicar cartão">
              <Copy size={15} />
            </button>
          )}
          <button className={styles.actionBtn} onClick={() => onEdit(cartao)} aria-label="Editar cartão" title="Editar cartão">
            <Edit2 size={15} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnWarn}`}
            onClick={() => onToggleAtivo(cartao.id)}
            aria-label={cartao.ativo ? 'Desativar cartão' : 'Ativar cartão'}
            title={cartao.ativo ? 'Desativar cartão' : 'Ativar cartão'}
          >
            <Power size={15} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Excluir cartão"
            title="Excluir cartão"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className={styles.header}>
          <div className={`${styles.icon} ${cartao.proprietarioId === 'usuario2' ? styles.iconP2 : ''}`}>
            <IconComponent size={20} />
          </div>
          <div className={styles.headerText}>
            <div className={styles.title}>{cartao.nome}</div>
            <div className={styles.numero}>{numeroCartao}</div>
          </div>
        </div>

        <div className={styles.badges}>
          {nomeProprietario && (
            <span className={`${styles.badge} ${cartao.proprietarioId === 'usuario2' ? styles.badgeP2 : styles.badgeP1}`}>
              {nomeProprietario}
            </span>
          )}
          {cartao.tipo && <span className={styles.badge}>{cartao.tipo === 'principal' ? 'Principal' : 'Adicional'}</span>}
          {!cartao.ativo && <span className={`${styles.badge} ${styles.badgeWarn}`}>Inativo</span>}
        </div>

        <div className={styles.rows}>
          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Limite</span>
            <span className={styles.rowValue}>{formatCurrencyWithPrivacy(cartao.limite, hideValues)}</span>
          </div>
          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Disponível</span>
            <span className={`${styles.rowValue} ${styles.rowValuePositive}`}>
              {formatCurrencyWithPrivacy(cartao.limiteDisponivel, hideValues)}
            </span>
          </div>
          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Fatura Atual</span>
            <span className={`${styles.rowValue} ${styles.rowValueNegative}`}>
              {formatCurrencyWithPrivacy(cartao.faturaAtual, hideValues)}
            </span>
          </div>
        </div>

        <div className={styles.progressWrap}>
          <div className={styles.progressLabelRow}>
            <span>Uso do limite</span>
            <span>{hideValues ? '•••' : `${porcentagemUso.toFixed(0)}%`}</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={`${styles.progressFill} ${progressClass}`} style={{ width: `${porcentagemUso}%` }} />
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerCol}>
            <span className={styles.footerLabel}>Fechamento</span>
            <span className={styles.footerValue}>Dia {cartao.fechamento}</span>
          </div>
          <div className={`${styles.footerCol} ${styles.footerColRight}`}>
            <span className={styles.footerLabel}>Vencimento</span>
            <span className={styles.footerValue}>Dia {cartao.vencimento}</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Excluir cartão"
        message={`Tem certeza que deseja excluir o cartão "${cartao.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
}
