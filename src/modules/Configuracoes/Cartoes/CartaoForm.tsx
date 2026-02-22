import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { CartaoCredito } from '@/types';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import { useCasal } from '@/hooks/useCasal';

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

  const getInputClassName = (hasError: boolean) =>
    `p-md border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? 'border-negative focus:border-negative focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
        : 'border-border focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]'
    }`;

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
      // Valores padrão para novo cartão
      setProprietarioId('usuario1');
      setTipo('principal');
    }
  }, [cartao]);

  // Auto-focus no primeiro campo quando modal abre
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

  // Atalhos de teclado
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

    // Validações por campo
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

    // Validação cruzada: fechamento não pode ser depois do vencimento
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
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-md animate-[fadeIn_0.2s_ease]" onClick={handleClose}>
      <div className="bg-surface rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-lg animate-[slideUp_0.3s_ease] md:rounded-lg md:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-lg border-b border-border">
          <h3 className="text-xl font-semibold text-text-primary m-0">
            {isEditMode ? 'Editar Cartão' : 'Novo Cartão'}
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
              Nome do Cartão *
            </label>
            <input
              ref={nomeInputRef}
              id="nome"
              type="text"
              className={getInputClassName(!!fieldErrors.nome)}
              value={nome}
              onChange={(e) => {
                clearFieldError('nome');
                setNome(e.target.value);
              }}
              placeholder="Ex: Nubank, Inter"
              disabled={loading}
              autoFocus
            />
            {fieldErrors.nome && (
              <p className="text-sm text-negative" role="alert">
                {fieldErrors.nome}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="limite" className="text-sm font-medium text-text-primary">
              Limite *
            </label>
            <input
              id="limite"
              type="text"
              inputMode="decimal"
              className={getInputClassName(!!fieldErrors.limite)}
              value={limite}
              onChange={(e) => {
                clearFieldError('limite');
                setLimite(handleNumberInputChange(e, true));
              }}
              placeholder="0,00"
              disabled={loading}
            />
            {fieldErrors.limite && (
              <p className="text-sm text-negative" role="alert">
                {fieldErrors.limite}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-sm font-medium text-text-primary">
              Proprietário *
            </label>
            <div className="flex gap-md">
              <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
                <input
                  type="radio"
                  name="proprietario"
                  checked={proprietarioId === 'usuario1'}
                  onChange={() => {
                    clearFieldError('proprietarioId');
                    setProprietarioId('usuario1');
                  }}
                  disabled={loading}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>{usuario1Nome}</span>
              </label>
              <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
                <input
                  type="radio"
                  name="proprietario"
                  checked={proprietarioId === 'usuario2'}
                  onChange={() => {
                    clearFieldError('proprietarioId');
                    setProprietarioId('usuario2');
                  }}
                  disabled={loading}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>{usuario2Nome}</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-sm font-medium text-text-primary">
              Tipo de Cartão *
            </label>
            <div className="flex gap-md">
              <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === 'principal'}
                  onChange={() => {
                    clearFieldError('tipo');
                    setTipo('principal');
                  }}
                  disabled={loading}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Principal</span>
              </label>
              <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === 'adicional'}
                  onChange={() => {
                    clearFieldError('tipo');
                    setTipo('adicional');
                  }}
                  disabled={loading}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Adicional</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label htmlFor="fechamento" className="text-sm font-medium text-text-primary">
                Dia de Fechamento *
              </label>
              <input
                id="fechamento"
                type="text"
                inputMode="numeric"
                className={getInputClassName(!!fieldErrors.fechamento)}
                value={fechamento}
                onChange={(e) => {
                  clearFieldError('fechamento');
                  clearFieldError('vencimento'); // Limpar erro de vencimento também ao alterar fechamento
                  setFechamento(handleNumberInputChange(e, false));
                }}
                disabled={loading}
              />
              {fieldErrors.fechamento && (
                <p className="text-sm text-negative" role="alert">
                  {fieldErrors.fechamento}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-xs">
              <label htmlFor="vencimento" className="text-sm font-medium text-text-primary">
                Dia de Vencimento *
              </label>
              <input
                id="vencimento"
                type="text"
                inputMode="numeric"
                className={getInputClassName(!!fieldErrors.vencimento)}
                value={vencimento}
                onChange={(e) => {
                  clearFieldError('vencimento');
                  clearFieldError('fechamento'); // Limpar erro de fechamento também ao alterar vencimento
                  setVencimento(handleNumberInputChange(e, false));
                }}
                disabled={loading}
              />
              {fieldErrors.vencimento && (
                <p className="text-sm text-negative" role="alert">
                  {fieldErrors.vencimento}
                </p>
              )}
            </div>
          </div>

          {isEditMode && (
            <div className="flex flex-col gap-xs">
              <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
                <input
                  type="checkbox"
                  className="w-[18px] h-[18px] cursor-pointer"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  disabled={loading}
                />
                <span>Cartão ativo</span>
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
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
