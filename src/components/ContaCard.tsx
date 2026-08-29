import { useState } from 'react';
import { Wallet, Edit2, Trash2, Power, Copy } from 'lucide-react';
import type { Conta } from '@/types';
import { formatCurrencyWithPrivacy } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCasal } from '@/hooks/useCasal';
import styles from './ContaCard.module.css';

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

interface ContaCardProps {
  conta: Conta;
  hideSaldo?: boolean;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onToggleAtiva: (id: string) => void;
  onDuplicate?: (conta: Conta) => void;
}

export function ContaCard({
  conta,
  hideSaldo = false,
  onEdit,
  onDelete,
  onToggleAtiva,
  onDuplicate,
}: ContaCardProps) {
  const { getNomePessoa } = useCasal();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getContaIcon = () => {
    if (conta.icone) {
      const IconComponent = iconMap[conta.icone];
      if (IconComponent) return <IconComponent size={20} />;
    }
    const defaultIconName = tipoIconNames[conta.tipo];
    const DefaultIcon = iconMap[defaultIconName];
    return DefaultIcon ? <DefaultIcon size={20} /> : <Wallet size={20} />;
  };

  const nomeProprietario = conta.proprietarioId
    ? (conta.nomeProprietario || getNomePessoa(conta.proprietarioId))
    : null;

  const handleDelete = () => {
    onDelete(conta.id);
    setShowConfirmDelete(false);
  };

  return (
    <>
      <div className={`${styles.card} ${!conta.ativa ? styles.cardInactive : ''}`}>
        <div className={styles.actions}>
          {onDuplicate && (
            <button
              className={styles.actionBtn}
              onClick={() => onDuplicate(conta)}
              aria-label="Duplicar conta"
              title="Duplicar conta"
            >
              <Copy size={15} />
            </button>
          )}
          <button
            className={styles.actionBtn}
            onClick={() => onEdit(conta)}
            aria-label="Editar conta"
            title="Editar conta"
          >
            <Edit2 size={15} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnWarn}`}
            onClick={() => onToggleAtiva(conta.id)}
            aria-label={conta.ativa ? 'Desativar conta' : 'Ativar conta'}
            title={conta.ativa ? 'Desativar conta' : 'Ativar conta'}
          >
            <Power size={15} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Excluir conta"
            title="Excluir conta"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className={styles.header}>
          <div className={`${styles.icon} ${conta.proprietarioId === 'usuario2' ? styles.iconP2 : ''}`}>
            {getContaIcon()}
          </div>
          <div className={styles.headerText}>
            <div className={styles.title}>{conta.nome}</div>
            <div className={styles.subtitle}>{tipoLabels[conta.tipo]}</div>
          </div>
        </div>

        <div className={styles.badges}>
          {nomeProprietario && (
            <span className={`${styles.badge} ${conta.proprietarioId === 'usuario2' ? styles.badgeP2 : styles.badgeP1}`}>
              {nomeProprietario}
            </span>
          )}
          {!conta.ativa && <span className={`${styles.badge} ${styles.badgeWarn}`}>Inativa</span>}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerLabel}>Saldo</span>
          <span className={`${styles.value} ${conta.saldo >= 0 ? styles.valuePositive : styles.valueNegative}`}>
            {formatCurrencyWithPrivacy(conta.saldo, hideSaldo)}
          </span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Excluir conta?"
        message={`Ao excluir a conta "${conta.nome}", o histórico de saldo será perdido. Deseja continuar?`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
        variant="danger"
      />
    </>
  );
}
