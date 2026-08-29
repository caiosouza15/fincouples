import { useState } from 'react';
import type { Conta } from '@/types';
import { formatCurrencyWithPrivacy } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pencil, Trash2, Copy, Wallet } from 'lucide-react';
import styles from './ContaItem.module.css';

const tipoLabels: Record<Conta['tipo'], string> = {
  corrente: 'Conta Corrente',
  poupanca: 'Poupança',
  investimento: 'Investimento',
};

const tipoIconNames: Record<Conta['tipo'], string> = {
  corrente: 'conta-corrente',
  poupanca: 'poupanca',
  investimento: 'investimento',
};

interface ContaItemProps {
  conta: Conta;
  hideSaldo?: boolean;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (conta: Conta) => void;
}

export function ContaItem({ conta, hideSaldo = false, onEdit, onDelete, onDuplicate }: ContaItemProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getContaIcon = () => {
    if (conta.icone) {
      const IconComponent = iconMap[conta.icone];
      if (IconComponent) return <IconComponent size={18} />;
    }
    const defaultIconName = tipoIconNames[conta.tipo];
    const DefaultIcon = iconMap[defaultIconName];
    return DefaultIcon ? <DefaultIcon size={18} /> : <Wallet size={18} />;
  };

  const handleConfirmDelete = () => {
    onDelete(conta.id);
    setShowConfirmDelete(false);
  };

  return (
    <div className={`${styles.row} ${!conta.ativa ? styles.rowInactive : ''}`}>
      <div className={styles.icon}>{getContaIcon()}</div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{conta.nome}</span>
          {conta.nomeProprietario && <span className={styles.badge}>{conta.nomeProprietario}</span>}
          {!conta.ativa && <span className={styles.badge}>Inativa</span>}
        </div>
        <div className={styles.type}>{tipoLabels[conta.tipo]}</div>
      </div>

      <span className={`${styles.value} ${conta.saldo >= 0 ? styles.valuePositive : styles.valueNegative}`}>
        {formatCurrencyWithPrivacy(conta.saldo, hideSaldo)}
      </span>

      <div className={styles.actions}>
        {onDuplicate && (
          <button className={styles.actionBtn} onClick={() => onDuplicate(conta)} aria-label="Duplicar conta" title="Duplicar conta">
            <Copy size={14} />
          </button>
        )}
        <button className={styles.actionBtn} onClick={() => onEdit(conta)} aria-label="Editar conta" title="Editar conta">
          <Pencil size={14} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={() => setShowConfirmDelete(true)}
          aria-label="Excluir conta"
          title="Excluir conta"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Excluir conta?"
        message={`Ao excluir a conta "${conta.nome}", o histórico de saldo será perdido. Deseja continuar?`}
        confirmText="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        variant="danger"
      />
    </div>
  );
}
