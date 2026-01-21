import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Conta } from '@/types';
import { getContas, createConta, updateConta, deleteConta } from '@/services/contasService';

interface ContasContextType {
  contas: Conta[];
  loading: boolean;
  error: string | null;
  fetchContas: () => Promise<void>;
  addConta: (conta: Omit<Conta, 'id'>) => Promise<void>;
  editConta: (id: string, conta: Partial<Conta>) => Promise<void>;
  removeConta: (id: string) => Promise<void>;
  toggleContaAtiva: (id: string) => Promise<void>;
  getSaldoGeral: () => number;
}

const ContasContext = createContext<ContasContextType | undefined>(undefined);

export function ContasProvider({ children }: { children: ReactNode }) {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContas();
      setContas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contas');
      console.error('Erro ao buscar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  const addConta = async (conta: Omit<Conta, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newConta = await createConta(conta);
      setContas((prev) => [...prev, newConta]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editConta = async (id: string, conta: Partial<Conta>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedConta = await updateConta(id, conta);
      setContas((prev) =>
        prev.map((c) => (c.id === id ? updatedConta : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeConta = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteConta(id);
      setContas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleContaAtiva = async (id: string) => {
    const conta = contas.find((c) => c.id === id);
    if (conta) {
      await editConta(id, { ativa: !conta.ativa });
    }
  };

  const getSaldoGeral = (): number => {
    return contas
      .filter((c) => c.ativa)
      .reduce((total, conta) => total + conta.saldo, 0);
  };

  useEffect(() => {
    fetchContas();
  }, []);

  return (
    <ContasContext.Provider
      value={{
        contas,
        loading,
        error,
        fetchContas,
        addConta,
        editConta,
        removeConta,
        toggleContaAtiva,
        getSaldoGeral,
      }}
    >
      {children}
    </ContasContext.Provider>
  );
}

export function useContas() {
  const context = useContext(ContasContext);
  if (context === undefined) {
    throw new Error('useContas deve ser usado dentro de um ContasProvider');
  }
  return context;
}