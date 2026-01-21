import { useState, useEffect } from 'react';
import type { Conta } from '@/types';

interface ContaFormProps {
  conta?: Conta | null;
  onClose: () => void;
  onSave: (conta: Omit<Conta, 'id'> | Conta) => Promise<void>;
}

export function ContaForm({ conta, onClose, onSave }: ContaFormProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<Conta['tipo']>('corrente');
  const [saldo, setSaldo] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!conta;

  useEffect(() => {
    if (conta) {
      setNome(conta.nome);
      setTipo(conta.tipo);
      setSaldo(conta.saldo.toString());
      setAtiva(conta.ativa);
    }
  }, [conta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!nome.trim()) {
      setError('Nome da conta é obrigatório');
      return;
    }

    const saldoNum = parseFloat(saldo);
    if (isNaN(saldoNum)) {
      setError('Saldo deve ser um número válido');
      return;
    }

    try {
      setLoading(true);
      
      const contaData: Omit<Conta, 'id'> | Conta = isEditMode && conta
        ? { ...conta, nome: nome.trim(), tipo, saldo: saldoNum, ativa }
        : {
            nome: nome.trim(),
            tipo,
            saldo: saldoNum,
            ativa,
            casalId: 'default', // Por enquanto fixo
          };

      await onSave(contaData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar conta');
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
            {isEditMode ? 'Editar Conta' : 'Nova Conta'}
          </h3>
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-sm cursor-pointer text-lg text-text-secondary transition-all duration-200 hover:bg-background hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClose}
            aria-label="Fechar"
            disabled={loading}
          >
            ✕
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
              Nome da Conta *
            </label>
            <input
              id="nome"
              type="text"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: NuConta, Banco do Brasil"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="tipo" className="text-sm font-medium text-text-primary">
              Tipo *
            </label>
            <select
              id="tipo"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
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
            <label htmlFor="saldo" className="text-sm font-medium text-text-primary">
              Saldo Inicial *
            </label>
            <input
              id="saldo"
              type="number"
              step="0.01"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value)}
              placeholder="0,00"
              required
              disabled={loading}
            />
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
              className="py-md px-lg rounded-md text-base font-medium cursor-pointer transition-all duration-200 border-none bg-positive text-white hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed md:w-auto w-full"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Conta'}
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

        @media (max-width: 768px) {
          .modal-content {
            border-radius: 0.75rem 0.75rem 0 0;
            max-width: 100%;
            max-height: 90vh;
          }
        }
      `}</style>
    </div>
  );
}