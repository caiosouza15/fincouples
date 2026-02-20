import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartaoCredito } from '@/types';
import { getCartoes, createCartao, updateCartao, deleteCartao } from '@/services/cartoesService';

interface CartoesContextType {
  cartoes: CartaoCredito[];
  loading: boolean;
  error: string | null;
  fetchCartoes: () => Promise<void>;
  addCartao: (cartao: Omit<CartaoCredito, 'id'>) => Promise<CartaoCredito>;
  editCartao: (id: string, cartao: Partial<CartaoCredito>) => Promise<void>;
  removeCartao: (id: string) => Promise<void>;
  toggleCartaoAtivo: (id: string) => Promise<void>;
  getLimiteDisponivel: (cartaoId: string) => number;
  getCartaoById: (id: string) => CartaoCredito | undefined;
}

const CartoesContext = createContext<CartoesContextType | undefined>(undefined);

export function CartoesProvider({ children }: { children: ReactNode }) {
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCartoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCartoes();
      setCartoes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cartões');
      console.error('Erro ao buscar cartões:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCartao = async (cartao: Omit<CartaoCredito, 'id'>): Promise<CartaoCredito> => {
    try {
      setLoading(true);
      setError(null);
      const newCartao = await createCartao(cartao);
      setCartoes((prev) => [...prev, newCartao]);
      return newCartao;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cartão');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editCartao = async (id: string, cartao: Partial<CartaoCredito>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCartao = await updateCartao(id, cartao);
      setCartoes((prev) =>
        prev.map((c) => (c.id === id ? updatedCartao : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar cartão');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeCartao = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCartao(id);
      setCartoes((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir cartão');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleCartaoAtivo = async (id: string) => {
    const cartao = cartoes.find((c) => c.id === id);
    if (cartao) {
      await editCartao(id, { ativo: !cartao.ativo });
    }
  };

  const getLimiteDisponivel = (cartaoId: string): number => {
    const cartao = cartoes.find((c) => c.id === cartaoId);
    if (!cartao) return 0;
    return cartao.limiteDisponivel;
  };

  const getCartaoById = (id: string): CartaoCredito | undefined => {
    return cartoes.find((c) => c.id === id);
  };

  useEffect(() => {
    fetchCartoes();
  }, []);

  return (
    <CartoesContext.Provider
      value={{
        cartoes,
        loading,
        error,
        fetchCartoes,
        addCartao,
        editCartao,
        removeCartao,
        toggleCartaoAtivo,
        getLimiteDisponivel,
        getCartaoById,
      }}
    >
      {children}
    </CartoesContext.Provider>
  );
}

export function useCartoes() {
  const context = useContext(CartoesContext);
  if (context === undefined) {
    throw new Error('useCartoes deve ser usado dentro de um CartoesProvider');
  }
  return context;
}
