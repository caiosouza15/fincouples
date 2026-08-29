import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MetaFinanceira } from '@/types';
import type { Categoria } from '@/types';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import styles from './MetaForm.module.css';

interface MetaFormProps {
  meta?: MetaFinanceira | null;
  categorias: Categoria[];
  onClose: () => void;
  onSave: (meta: Omit<MetaFinanceira, 'id'> | MetaFinanceira) => Promise<void>;
}

export function MetaForm({ meta, categorias, onClose, onSave }: MetaFormProps) {
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [valorObjetivo, setValorObjetivo] = useState('');
  const [valorAtual, setValorAtual] = useState('');
  const [prazo, setPrazo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!meta;

  useEffect(() => {
    if (meta) {
      setTitulo(meta.titulo);
      setCategoriaId(meta.categoriaId ?? '');
      setValorObjetivo(formatNumberInput(meta.valorObjetivo));
      setValorAtual(formatNumberInput(meta.valorAtual));
      setPrazo(meta.prazo ? new Date(meta.prazo).toISOString().slice(0, 10) : '');
    } else {
      setValorAtual('0');
    }
  }, [meta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const tituloTrim = titulo.trim();
    if (!tituloTrim) {
      setError('Título é obrigatório');
      return;
    }
    const vObjetivo = parseNumberInput(valorObjetivo);
    const vAtual = parseNumberInput(valorAtual);
    if (vObjetivo <= 0) {
      setError('Valor objetivo deve ser maior que zero');
      return;
    }
    if (vAtual < 0) {
      setError('Valor atual não pode ser negativo');
      return;
    }

    setLoading(true);
    try {
      if (meta) {
        await onSave({
          ...meta,
          titulo: tituloTrim,
          categoriaId: categoriaId || undefined,
          valorObjetivo: vObjetivo,
          valorAtual: vAtual,
          prazo: prazo ? new Date(prazo) : undefined,
        });
      } else {
        await onSave({
          casalId: 'casal-1',
          titulo: tituloTrim,
          categoriaId: categoriaId || undefined,
          valorObjetivo: vObjetivo,
          valorAtual: vAtual,
          concluida: false,
          prazo: prazo ? new Date(prazo) : undefined,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const categoriasDespesa = categorias.filter((c) => c.tipo === 'despesa');

  return (
    <div className={styles.overlay} onClick={() => !loading && onClose()}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditMode ? 'Editar meta' : 'Nova meta'}</h2>
          <button onClick={onClose} disabled={loading} className={styles.closeBtn} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Viagem para o Nordeste"
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Categoria (opcional)</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              <option value="">Nenhuma</option>
              {categoriasDespesa.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Valor objetivo *</label>
            <input
              type="text"
              inputMode="decimal"
              value={valorObjetivo}
              onChange={(e) => setValorObjetivo(handleNumberInputChange(e))}
              placeholder="0,00"
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Valor atual</label>
            <input
              type="text"
              inputMode="decimal"
              value={valorAtual}
              onChange={(e) => setValorAtual(handleNumberInputChange(e))}
              placeholder="0,00"
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Prazo (opcional)</label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} disabled={loading} className={styles.btnGhost}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
