import { useState } from 'react';
import type { Lancamento } from '@/types';
import { formatCurrency } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { useCategorias } from '@/hooks/useCategorias';
import { useContas } from '@/hooks/useContas';
import { useCasal } from '@/hooks/useCasal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pencil, Trash2, CheckCircle2, Circle, Copy, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import styles from './Lancamentos.module.css';

interface LancamentoItemProps {
  lancamento: Lancamento;
  onEdit: (lancamento: Lancamento) => void;
  onDelete: (id: string) => void;
  onTogglePago: (id: string) => void;
  onDuplicate?: (lancamento: Lancamento) => void;
}

export function LancamentoItem({
  lancamento,
  onEdit,
  onDelete,
  onTogglePago,
  onDuplicate,
}: LancamentoItemProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { categorias } = useCategorias();
  const { contas } = useContas();
  const { getNomePessoa } = useCasal();

  const categoria = categorias.find((c) => c.id === lancamento.categoriaId);
  const conta = lancamento.contaId ? contas.find((c) => c.id === lancamento.contaId) : null;
  const nomePessoa = lancamento.pessoaId ? (lancamento.nomePessoa || getNomePessoa(lancamento.pessoaId)) : null;

  const getCategoriaIcon = () => {
    if (categoria?.icone) {
      const IconComponent = iconMap[categoria.icone];
      if (IconComponent) return <IconComponent size={17} />;
    }
    return isReceita ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />;
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleConfirmDelete = () => {
    onDelete(lancamento.id);
    setShowConfirmDelete(false);
  };

  const isReceita = lancamento.tipo === 'receita';

  return (
    <>
      <div id={`lancamento-${lancamento.id}`} className={`${styles.row} ${!lancamento.pago ? styles.rowPendente : ''}`}>
        <div className={`${styles.icon} ${isReceita ? styles.iconReceita : styles.iconDespesa}`}>
          {getCategoriaIcon()}
        </div>

        <div className={styles.info}>
          <div className={styles.infoTop}>
            <span className={styles.categoria}>{categoria?.nome || 'Sem categoria'}</span>
            {nomePessoa && lancamento.tipo === 'despesa' && (
              <span className={`${styles.badge} ${lancamento.pessoaId === 'usuario2' ? styles.badgeP2 : styles.badgeP1}`}>
                {nomePessoa}
              </span>
            )}
            {!lancamento.pago && <span className={`${styles.badge} ${styles.badgePendente}`}>Pendente</span>}
          </div>
          <div className={styles.descricao}>{lancamento.descricao || 'Sem descrição'}</div>
          <div className={styles.meta}>{formatDate(lancamento.data)} · {conta?.nome || 'Sem conta'}</div>
        </div>

        <span className={`${styles.valor} ${isReceita ? styles.valorPositivo : styles.valorNegativo}`}>
          {isReceita ? '+' : '-'} {formatCurrency(lancamento.valor)}
        </span>

        <div className={styles.actions}>
          {onDuplicate && (
            <button className={styles.actionBtn} onClick={() => onDuplicate(lancamento)} aria-label="Duplicar lançamento" title="Duplicar lançamento">
              <Copy size={14} />
            </button>
          )}
          <button
            className={`${styles.actionBtn} ${lancamento.pago ? styles.actionBtnActive : ''}`}
            onClick={() => onTogglePago(lancamento.id)}
            aria-label={lancamento.pago ? 'Marcar como pendente' : 'Marcar como pago'}
            title={lancamento.pago ? 'Marcar como pendente' : 'Marcar como pago'}
          >
            {lancamento.pago ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          </button>
          <button className={styles.actionBtn} onClick={() => onEdit(lancamento)} aria-label="Editar lançamento" title="Editar lançamento">
            <Pencil size={14} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Excluir lançamento"
            title="Excluir lançamento"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Excluir lançamento?"
        message="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        variant="danger"
      />
    </>
  );
}
