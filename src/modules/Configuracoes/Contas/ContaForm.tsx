import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Conta } from '@/types';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import { useCasal } from '@/hooks/useCasal';

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

  const getInputClassName = (hasError: boolean) =>
    `p-md border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? 'border-negative focus:border-negative focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
        : 'border-border focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]'
    }`;

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
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-md animate-[fadeIn_0.2s_ease]" onClick={handleClose}>
      <div className="bg-surface rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-lg animate-[slideUp_0.3s_ease] md:rounded-lg md:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-lg border-b border-border">
          <h3 className="text-xl font-semibold text-text-primary m-0">
            {isEditMode ? 'Editar Conta' : 'Nova Conta'}
          </h3>
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-sm cursor-pointer text-text-secondary transition-all duration-200 hover:bg-background hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClose}
            aria-label="Fechar"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
          {error && (
            <div className="p-md bg-negative/10 border border-negative rounded-md text-negative text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-xs">
            <label htmlFor="nome" className="text-sm font-medium text-text-primary">
              Nome da Conta *
            </label>
            <input
              ref={nomeInputRef}
              id="nome"
              type="text"
              className={getInputClassName(!!fieldErrors.nome)}
              value={nome}
              onChange={(e) => { setNome(e.target.value); clearFieldError('nome'); }}
              placeholder="Ex: NuConta, Banco do Brasil"
              required
              disabled={loading}
            />
            {fieldErrors.nome && (
              <p className="text-sm text-negative">{fieldErrors.nome}</p>
            )}
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="tipo" className="text-sm font-medium text-text-primary">
              Tipo *
            </label>
            <select
              id="tipo"
              className={getInputClassName(false)}
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

          <div className="flex flex-col gap-xs">
            <span className="text-sm font-medium text-text-primary">Proprietário</span>
            <div className="flex gap-lg pt-xs" role="group" aria-label="Proprietário da conta">
              <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
                <input
                  type="radio"
                  name="proprietario"
                  checked={proprietarioId === 'usuario1'}
                  onChange={() => setProprietarioId('usuario1')}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <span>{usuario1Nome}</span>
              </label>
              <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
                <input
                  type="radio"
                  name="proprietario"
                  checked={proprietarioId === 'usuario2'}
                  onChange={() => setProprietarioId('usuario2')}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <span>{usuario2Nome}</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="saldo" className="text-sm font-medium text-text-primary">
              Saldo Inicial *
            </label>
            <input
              id="saldo"
              type="text"
              inputMode="decimal"
              className={getInputClassName(!!fieldErrors.saldo)}
              value={saldo}
              onChange={(e) => { setSaldo(handleNumberInputChange(e, true)); clearFieldError('saldo'); }}
              placeholder="0,00"
              required
              disabled={loading}
            />
            {fieldErrors.saldo && (
              <p className="text-sm text-negative">{fieldErrors.saldo}</p>
            )}
          </div>

          {isEditMode && (
            <div className="flex flex-col gap-xs">
              <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
                <input
                  type="checkbox"
                  className="w-[18px] h-[18px] cursor-pointer"
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                  disabled={loading}
                />
                <span>Conta ativa</span>
              </label>
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row gap-md justify-end mt-md pt-md border-t border-border">
            <button
              type="button"
              className="py-md px-lg rounded-md text-base font-medium cursor-pointer transition-all duration-200 border-none bg-surface text-text-primary border border-border hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed md:w-auto w-full"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-md px-lg rounded-md text-base font-medium cursor-pointer transition-all duration-200 border-none bg-positive text-white hover:bg-positive/90 disabled:opacity-60 disabled:cursor-not-allowed md:w-auto w-full"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}