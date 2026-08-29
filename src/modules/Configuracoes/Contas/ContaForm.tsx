import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Conta } from '@/types';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import { useCasal } from '@/hooks/useCasal';
import styles from './ContaForm.module.css';

interface ContaFormProps {
  conta?: Conta | null;
  onClose: () => void;
  onSave: (conta: Omit<Conta, 'id'> | Conta) => Promise<void>;
}

export function ContaForm({ conta, onClose, onSave }: ContaFormProps) {
  const { usuario1Nome, usuario2Nome, getNomePessoa } = useCasal();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<Conta['tipo']>('corrente');
  const [proprietarioId, setProprietarioId] = useState<'usuario1' | 'usuario2'>('usuario1');
  const [saldo, setSaldo] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const nomeInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditMode = !!conta;

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const inputClassName = (hasError: boolean) => `${styles.input} ${hasError ? styles.inputError : ''}`;

  useEffect(() => {
    if (conta) {
      setNome(conta.nome);
      setTipo(conta.tipo);
      setProprietarioId(conta.proprietarioId ?? 'usuario1');
      setSaldo(formatNumberInput(conta.saldo));
      setAtiva(conta.ativa);
    } else {
      setProprietarioId('usuario1');
    }
  }, [conta]);

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
        if (!loading) handleClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (formRef.current && !loading) formRef.current.requestSubmit();
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
    if (!nome.trim()) errors.nome = 'Nome da conta é obrigatório';
    const saldoNum = parseNumberInput(saldo);
    if (isNaN(saldoNum)) errors.saldo = 'Saldo deve ser um número válido';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);

      const nomeProprietario = getNomePessoa(proprietarioId);
      const contaData: Omit<Conta, 'id'> | Conta = isEditMode && conta
        ? { ...conta, nome: nome.trim(), tipo, proprietarioId, nomeProprietario, saldo: saldoNum, ativa }
        : {
            nome: nome.trim(),
            tipo,
            proprietarioId,
            nomeProprietario,
            saldo: saldoNum,
            ativa,
            casalId: 'default',
          };

      await onSave(contaData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{isEditMode ? 'Editar Conta' : 'Nova Conta'}</h3>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Fechar" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          <div className={styles.field}>
            <label htmlFor="nome" className={styles.label}>Nome da Conta *</label>
            <input
              ref={nomeInputRef}
              id="nome"
              type="text"
              className={inputClassName(!!fieldErrors.nome)}
              value={nome}
              onChange={(e) => { setNome(e.target.value); clearFieldError('nome'); }}
              placeholder="Ex: NuConta, Banco do Brasil"
              required
              disabled={loading}
            />
            {fieldErrors.nome && <p className={styles.fieldError}>{fieldErrors.nome}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="tipo" className={styles.label}>Tipo *</label>
            <select
              id="tipo"
              className={styles.select}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Conta['tipo'])}
              required
              disabled={loading}
            >
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Proprietário</span>
            <div className={styles.radioGroup} role="group" aria-label="Proprietário da conta">
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="proprietario"
                  checked={proprietarioId === 'usuario1'}
                  onChange={() => setProprietarioId('usuario1')}
                  disabled={loading}
                />
                <span>{usuario1Nome}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="proprietario"
                  checked={proprietarioId === 'usuario2'}
                  onChange={() => setProprietarioId('usuario2')}
                  disabled={loading}
                />
                <span>{usuario2Nome}</span>
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="saldo" className={styles.label}>Saldo Inicial *</label>
            <input
              id="saldo"
              type="text"
              inputMode="decimal"
              className={inputClassName(!!fieldErrors.saldo)}
              value={saldo}
              onChange={(e) => { setSaldo(handleNumberInputChange(e, true)); clearFieldError('saldo'); }}
              placeholder="0,00"
              required
              disabled={loading}
            />
            {fieldErrors.saldo && <p className={styles.fieldError}>{fieldErrors.saldo}</p>}
          </div>

          {isEditMode && (
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} disabled={loading} />
                <span>Conta ativa</span>
              </label>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
