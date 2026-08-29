import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { MetaFinanceira } from '@/types';
import { getMetas, createMeta, updateMeta, deleteMeta } from '@/services/metasService';

interface MetasContextType {
  metas: MetaFinanceira[];
  loading: boolean;
  error: string | null;
  fetchMetas: () => Promise<void>;
  addMeta: (meta: Omit<MetaFinanceira, 'id'>) => Promise<MetaFinanceira>;
  editMeta: (id: string, meta: Partial<MetaFinanceira>) => Promise<void>;
  removeMeta: (id: string) => Promise<void>;
  toggleMetaConcluida: (id: string) => Promise<void>;
}

const MetasContext = createContext<MetasContextType | undefined>(undefined);

export function MetasProvider({ children }: { children: ReactNode }) {
  const [metas, setMetas] = useState<MetaFinanceira[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMetas();
      setMetas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar metas');
      console.error('Erro ao buscar metas:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMeta = async (meta: Omit<MetaFinanceira, 'id'>): Promise<MetaFinanceira> => {
    try {
      setLoading(true);
      setError(null);
      const newMeta = await createMeta(meta);
      setMetas((prev) => [...prev, newMeta]);
      return newMeta;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar meta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editMeta = async (id: string, meta: Partial<MetaFinanceira>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMeta = await updateMeta(id, meta);
      setMetas((prev) => prev.map((m) => (m.id === id ? updatedMeta : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar meta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMeta = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteMeta(id);
      setMetas((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir meta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleMetaConcluida = async (id: string) => {
    const meta = metas.find((m) => m.id === id);
    if (meta) {
      await editMeta(id, { concluida: !meta.concluida });
    }
  };

  useEffect(() => {
    fetchMetas();
  }, []);

  return (
    <MetasContext.Provider
      value={{
        metas,
        loading,
        error,
        fetchMetas,
        addMeta,
        editMeta,
        removeMeta,
        toggleMetaConcluida,
      }}
    >
      {children}
    </MetasContext.Provider>
  );
}

export function useMetas() {
  const context = useContext(MetasContext);
  if (context === undefined) {
    throw new Error('useMetas deve ser usado dentro de um MetasProvider');
  }
  return context;
}
