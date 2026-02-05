import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CartaoCredito } from '@/types';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';

interface CartaoFormProps {
  cartao?: CartaoCredito | null;
  onClose: () => void;
  onSave: (cartao: Omit<CartaoCredito, 'id'> | CartaoCredito) => Promise<void>;
}

export function CartaoForm({ cartao, onClose, onSave }: CartaoFormProps) {
  const [nome, setNome] = useState('');
  const [limite, setLimite] = useState('');
  const [fechamento, setFechamento] = useState('10');
  const [vencimento, setVencimento] = useState('15');
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!cartao;

  useEffect(() => {
    if (cartao) {
      setNome(cartao.nome);
      setLimite(formatNumberInput(cartao.limite));
      setFechamento(formatNumberInput(cartao.fechamento, false));
      setVencimento(formatNumberInput(cartao.vencimento, false));
      setAtivo(cartao.ativo);
    }
  }, [cartao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!nome.trim()) {
      setError('Nome do cartão é obrigatório');
      return;
    }

    const limiteNum = parseNumberInput(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) {
      setError('Limite deve ser um número maior que zero');
      return;
    }

    const fechamentoNum = parseNumberInput(fechamento);
    const vencimentoNum = parseNumberInput(vencimento);
    
    if (fechamentoNum < 1 || fechamentoNum > 31) {
      setError('Dia de fechamento deve ser entre 1 e 31');
      return;
    }

    if (vencimentoNum < 1 || vencimentoNum > 31) {
      setError('Dia de vencimento deve ser entre 1 e 31');
      return;
    }

    try {
      setLoading(true);
      
      const cartaoData: Omit<CartaoCredito, 'id'> | CartaoCredito = isEditMode && cartao
        ? { 
            ...cartao, 
            nome: nome.trim(), 
            limite: limiteNum, 
            fechamento: Math.round(fechamentoNum),
            vencimento: Math.round(vencimentoNum),
            ativo,
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
          };

      await onSave(cartaoData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cartão');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000] p-md animate-[fadeIn_0.2s_ease]" onClick={handleClose}>
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

        <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
          {error && (
            <div className="p-md bg-[#fee2e2] border border-negative rounded-md text-negative text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-xs">
            <label htmlFor="nome" className="text-sm font-medium text-text-primary">
              Nome do Cartão *
            </label>
            <input
              id="nome"
              type="text"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Nubank, Inter"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="limite" className="text-sm font-medium text-text-primary">
              Limite *
            </label>
            <input
              id="limite"
              type="text"
              inputMode="decimal"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={limite}
              onChange={(e) => setLimite(handleNumberInputChange(e, true))}
              placeholder="0,00"
              required
              disabled={loading}
            />
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
                className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                value={fechamento}
                onChange={(e) => setFechamento(handleNumberInputChange(e, false))}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label htmlFor="vencimento" className="text-sm font-medium text-text-primary">
                Dia de Vencimento *
              </label>
              <input
                id="vencimento"
                type="text"
                inputMode="numeric"
                className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                value={vencimento}
                onChange={(e) => setVencimento(handleNumberInputChange(e, false))}
                required
                disabled={loading}
              />
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
              className="py-md px-lg rounded-md text-base font-medium cursor-pointer transition-all duration-200 border-none bg-positive text-white hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed md:w-auto w-full"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Cartão'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
