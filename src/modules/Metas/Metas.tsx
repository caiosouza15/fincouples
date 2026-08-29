import { useState } from 'react';
import { Plus, Target, Check, Edit2, Trash2 } from 'lucide-react';
import { useMetas } from '@/hooks/useMetas';
import { useToast } from '@/hooks/useToast';
import { useCategorias } from '@/hooks/useCategorias';
import { formatCurrency } from '@/utils';
import type { MetaFinanceira } from '@/types';
import { MetaForm } from './MetaForm';
import styles from './Metas.module.css';

const Metas = () => {
  const { metas, addMeta, editMeta, removeMeta, toggleMetaConcluida, loading } = useMetas();
  const { categorias } = useCategorias();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [metaEditando, setMetaEditando] = useState<MetaFinanceira | null>(null);

  const metasAtivas = metas.filter((m) => !m.concluida);
  const metasConcluidas = metas.filter((m) => m.concluida);

  const handleAddMeta = () => {
    setMetaEditando(null);
    setShowForm(true);
  };

  const handleEditMeta = (meta: MetaFinanceira) => {
    setMetaEditando(meta);
    setShowForm(true);
  };

  const handleSaveMeta = async (metaData: Omit<MetaFinanceira, 'id'> | MetaFinanceira) => {
    try {
      if ('id' in metaData) {
        await editMeta(metaData.id, metaData);
        showToast('Meta atualizada com sucesso', 'success');
      } else {
        await addMeta(metaData);
        showToast('Meta criada com sucesso', 'success');
      }
      setShowForm(false);
      setMetaEditando(null);
    } catch (error) {
      showToast('Erro ao salvar meta', 'error');
      throw error;
    }
  };

  const handleDeleteMeta = async (id: string) => {
    try {
      await removeMeta(id);
      showToast('Meta excluída com sucesso', 'success');
    } catch {
      showToast('Erro ao excluir meta', 'error');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setMetaEditando(null);
  };

  const getCategoriaNome = (categoriaId?: string) => {
    if (!categoriaId) return null;
    return categorias.find((c) => c.id === categoriaId)?.nome ?? '—';
  };

  const renderMetaItem = (meta: MetaFinanceira) => {
    const percentual = meta.valorObjetivo > 0
      ? Math.min(100, Math.round((meta.valorAtual / meta.valorObjetivo) * 100))
      : 0;
    const categoriaNome = getCategoriaNome(meta.categoriaId);

    return (
      <div key={meta.id} className={`${styles.card} ${meta.concluida ? styles.cardConcluded : ''}`}>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => handleEditMeta(meta)}
            aria-label="Editar meta"
            title="Editar meta"
          >
            <Edit2 size={15} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={() => handleDeleteMeta(meta.id)}
            aria-label="Excluir meta"
            title="Excluir meta"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className={styles.top}>
          <button
            onClick={() => toggleMetaConcluida(meta.id)}
            className={`${styles.checkbox} ${meta.concluida ? styles.checkboxChecked : ''}`}
            aria-label={meta.concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
          >
            {meta.concluida && <Check size={14} />}
          </button>
          <div className={styles.titleWrap}>
            <div className={`${styles.title} ${meta.concluida ? styles.titleConcluded : ''}`}>{meta.titulo}</div>
            {categoriaNome && <span className={styles.categoryBadge}>{categoriaNome}</span>}
          </div>
        </div>

        <div>
          <div className={styles.progressHeader}>
            <span className={styles.progressValues}>
              {formatCurrency(meta.valorAtual)} / {formatCurrency(meta.valorObjetivo)}
            </span>
            <span className={styles.progressPct}>{percentual}%</span>
          </div>
          <div className={styles.progressTrack} style={{ marginTop: 8 }}>
            <div
              className={`${styles.progressFill} ${meta.concluida ? styles.progressFillConcluded : ''}`}
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : metas.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><Target size={26} /></div>
          <div>
            <div className={styles.emptyStateTitle}>Nenhuma meta cadastrada</div>
            <div className={styles.emptyStateMessage}>Crie metas para acompanhar seus objetivos financeiros.</div>
          </div>
          <button className={styles.emptyStateAction} onClick={handleAddMeta}>Criar meta</button>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <button className={styles.addBtn} onClick={handleAddMeta} aria-label="Adicionar meta">
              <Plus size={17} />
              <span>Adicionar</span>
            </button>
          </div>

          {metasAtivas.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Em andamento</span>
              <div className={styles.grid}>{metasAtivas.map(renderMetaItem)}</div>
            </div>
          )}

          {metasConcluidas.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Concluídas</span>
              <div className={styles.grid}>{metasConcluidas.map(renderMetaItem)}</div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <MetaForm
          meta={metaEditando}
          categorias={categorias}
          onClose={handleCloseForm}
          onSave={handleSaveMeta}
        />
      )}
    </div>
  );
};

export default Metas;
