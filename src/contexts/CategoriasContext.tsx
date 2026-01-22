import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Categoria } from '@/types';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '@/services/categoriasService';

interface CategoriasContextType {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  fetchCategorias: () => Promise<void>;
  addCategoria: (categoria: Omit<Categoria, 'id'>) => Promise<void>;
  editCategoria: (id: string, categoria: Partial<Categoria>) => Promise<void>;
  removeCategoria: (id: string) => Promise<void>;
  getCategoriasPorTipo: (tipo: 'receita' | 'despesa') => Categoria[];
  isPadrao: (id: string) => boolean;
}

const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined);

export function CategoriasProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategorias();
      setCategorias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCategoria = async (categoria: Omit<Categoria, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newCategoria = await createCategoria(categoria);
      setCategorias((prev) => [...prev, newCategoria]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editCategoria = async (id: string, categoria: Partial<Categoria>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCategoria = await updateCategoria(id, categoria);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? updatedCategoria : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeCategoria = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCategoria(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCategoriasPorTipo = (tipo: 'receita' | 'despesa'): Categoria[] => {
    return categorias.filter((c) => c.tipo === tipo);
  };

  const isPadrao = (id: string): boolean => {
    return id.startsWith('padrao-');
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return (
    <CategoriasContext.Provider
      value={{
        categorias,
        loading,
        error,
        fetchCategorias,
        addCategoria,
        editCategoria,
        removeCategoria,
        getCategoriasPorTipo,
        isPadrao,
      }}
    >
      {children}
    </CategoriasContext.Provider>
  );
}

export function useCategorias() {
  const context = useContext(CategoriasContext);
  if (context === undefined) {
    throw new Error('useCategorias deve ser usado dentro de um CategoriasProvider');
  }
  return context;
}
