import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { CartaoCredito } from '@/types';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import { useCasal } from '@/hooks/useCasal';
import styles from './CartaoForm.module.css';

interface CartaoFormProps {
  cartao?: CartaoCredito | null;
  onClose: () => void;
  onSave: (cartao: Omit<CartaoCredito, 'id'> | CartaoCredito) => Promise<void>;
}

export function CartaoForm({ cartao, onClose, onSave }: CartaoFormProps) {
  const { usuario1Nome, usuario2Nome, getNomePessoa } = useCasal();
  const [nome, setNome] = useState('');
  const [limite, setLimite] = useState('');
  const [fechamento, setFechamento] = useState('10');
  const [vencimento, setVencimento] = useState('15');
  const [proprietarioId, setProprietarioId] = useState<'usuario1' | 'usuario2'>('usuario1');
  const [tipo, setTipo] = useState<'principal' | 'adicional'>('principal');
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const nomeInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditMode = !!cartao;

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const inputClassName = (hasError: boolean) => `${styles.input} ${hasError ? styles.inputError : ''}`;

  useEffect(() => {
    if (cartao) {
      setNome(cartao.nome);
      setLimite(formatNumberInput(cartao.limite));
      setFechamento(formatNumberInput(cartao.fechamento, false));
      setVencimento(formatNumberInput(cartao.vencimento, false));
      setProprietarioId(cartao.proprietarioId || 'usuario1');
      setTipo(cartao.tipo || 'principal');
      setAtivo(cartao.ativo);
    } else {
      setProprietarioId('usuario1');
      setTipo('principal');
    }
  }, [cartao]);

  useEffect(() => {
    if (nomeInputRef.current) {
      nomeInputRef.current.focus();
    }
  }, []);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!loading) {
          handleClose();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (formRef.current && !loading) {
          formRef.current.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!nome.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }

    const limiteNum = parseNumberInput(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) {
      errors.limite = limite.trim() ? 'Limite deve ser maior que zero' : 'Este campo é obrigatório';
    }

    const fechamentoNum = parseNumberInput(fechamento);
    const vencimentoNum = parseNumberInput(vencimento);

    if (isNaN(fechamentoNum) || fechamentoNum < 1 || fechamentoNum > 31) {
      errors.fechamento = fechamento.trim()
        ? 'Dia de fechamento deve ser entre 1 e 31'
        : 'Este campo é obrigatório';
    }

    if (isNaN(vencimentoNum) || vencimentoNum < 1 || vencimentoNum > 31) {
      errors.vencimento = vencimento.trim()
        ? 'Dia de vencimento deve ser entre 1 e 31'
        : 'Este campo é obrigatório';
    }

    if (!errors.fechamento && !errors.vencimento && fechamentoNum > vencimentoNum) {
      errors.fechamento = 'Dia de fechamento não pode ser depois do vencimento';
      errors.vencimento = 'Dia de vencimento deve ser igual ou depois do fechamento';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);

      const nomeProprietario = getNomePessoa(proprietarioId);

      const cartaoData: Omit<CartaoCredito, 'id'> | CartaoCredito = isEditMode && cartao
        ? {
            ...cartao,
            nome: nome.trim(),
            limite: limiteNum,
            fechamento: Math.round(fechamentoNum),
            vencimento: Math.round(vencimentoNum),
            ativo,
            proprietarioId,
            tipo,
            nomeProprietario,
          }
        : {
            nome: nome.trim(),
            limite: limiteNum,
            limiteDisponivel: limiteNum,
            faturaAtual: 0,
            fechamento: Math.round(fechamentoNum),
            vencimento: Math.round(vencimentoNum),
            ativo,
            casalId: 'casal-1',
            proprietarioId,
            tipo,
            nomeProprietario,
          };

      await onSave(cartaoData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cartão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{isEditMode ? 'Editar Cartão' : 'Novo Cartão'}</h3>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Fechar" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          <div className={styles.field}>
            <label htmlFor="nome" className={styles.label}>Nome do Cartão *</label>
            <input
              ref={nomeInputRef}
              id="nome"
              type="text"
              className={inputClassName(!!fieldErrors.nome)}
              value={nome}
              onChange={(e) => { clearFieldError('nome'); setNome(e.target.value); }}
              placeholder="Ex: Nubank, Inter"
              disabled={loading}
              autoFocus
            />
            {fieldErrors.nome && <p className={styles.fieldError}>{fieldErrors.nome}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="limite" className={styles.label}>Limite *</label>
            <input
              id="limite"
              type="text"
              inputMode="decimal"
              className={inputClassName(!!fieldErrors.limite)}
              value={limite}
              onChange={(e) => { clearFieldError('limite'); setLimite(handleNumberInputChange(e, true)); }}
              placeholder="0,00"
              disabled={loading}
            />
            {fieldErrors.limite && <p className={styles.fieldError}>{fieldErrors.limite}</p>}
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Proprietário *</span>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="proprietario"
                  checked={proprietarioId === 'usuario1'}
                  onChange={() => { clearFieldError('proprietarioId'); setProprietarioId('usuario1'); }}
                  disabled={loading}
                />
                <span>{usuario1Nome}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="proprietario"
                  checked={proprietarioId === 'usuario2'}
                  onChange={() => { clearFieldError('proprietarioId'); setProprietarioId('usuario2'); }}
                  disabled={loading}
                />
                <span>{usuario2Nome}</span>
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Tipo de Cartão *</span>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === 'principal'}
                  onChange={() => { clearFieldError('tipo'); setTipo('principal'); }}
                  disabled={loading}
                />
                <span>Principal</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === 'adicional'}
                  onChange={() => { clearFieldError('tipo'); setTipo('adicional'); }}
                  disabled={loading}
                />
                <span>Adicional</span>
              </label>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="fechamento" className={styles.label}>Dia de Fechamento *</label>
              <input
                id="fechamento"
                type="text"
                inputMode="numeric"
                className={inputClassName(!!fieldErrors.fechamento)}
                value={fechamento}
                onChange={(e) => {
                  clearFieldError('fechamento');
                  clearFieldError('vencimento');
                  setFechamento(handleNumberInputChange(e, false));
                }}
                disabled={loading}
              />
              {fieldErrors.fechamento && <p className={styles.fieldError}>{fieldErrors.fechamento}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="vencimento" className={styles.label}>Dia de Vencimento *</label>
              <input
                id="vencimento"
                type="text"
                inputMode="numeric"
                className={inputClassName(!!fieldErrors.vencimento)}
                value={vencimento}
                onChange={(e) => {
                  clearFieldError('vencimento');
                  clearFieldError('fechamento');
                  setVencimento(handleNumberInputChange(e, false));
                }}
                disabled={loading}
              />
              {fieldErrors.vencimento && <p className={styles.fieldError}>{fieldErrors.vencimento}</p>}
            </div>
          </div>

          {isEditMode && (
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} disabled={loading} />
                <span>Cartão ativo</span>
              </label>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
